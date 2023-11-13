---
id: parser
title: 解析器 (Parser)
---

我们将要构建的解析器称为[递归下降解析器](https://en.wikipedia.org/wiki/Recursive_descent_parser)，它是沿着语法手动进行并构建AST的过程。

解析器起初很简单，它包含源代码、词法分析器和从词法分析器中获取的当前标记。

```rust
pub struct Parser<'a> {
    /// 源代码
    source: &'a str,

    词法分析器: Lexer<'a>,

    /// 从词法分析器中获取的当前标记
    cur_token: Token,

    /// 前一个标记的结束范围
    prev_token_end: usize,
}

impl<'a> Parser<'a> {
    pub fn new(source: &'a str) -> Self {
        Self {
            source,
            lexer: Lexer::new(source),
            cur_token: Token::default(),
        }
    }

    pub fn parse(&mut self) -> Program<'a> {
        Ok(Program {
            node: Node {
                start: 0,
                end: self.source.len(),
            },
            body: vec![],
        })
    }
}
```

## 辅助函数

当前标记`cur_token: Token`保存了从词法分析器返回的当前标记。
通过添加一些辅助函数来导航和检查这个标记，我们可以使解析器代码更清晰。

```rust
impl<'a> Parser<'a> {
    fn start_node(&self) -> Node {
        let token = self.cur_token();
        Node::new(token.start, 0)
    }

    fn finish_node(&self, node: Node) -> Node {
        Node::new(node.start, self.prev_token_end)
    }

    fn cur_token(&self) -> &Token {
        &self.cur_token
    }

    fn cur_kind(&self) -> Kind {
        self.cur_token.kind
    }

    /// 检查当前索引是否有标记`Kind`
    fn at(&self, kind: Kind) -> bool {
        self.cur_kind() == kind
    }

    /// 如果我们在`Kind`处，则前进
    fn bump(&mut self, kind: Kind) {
        if self.at(kind) {
            self.advance();
        }
    }

    /// 前进到任何标记
    fn bump_any(&mut self) {
        self.advance();
    }

    /// 前进并返回true（如果我们在`Kind`处），否则返回false
    fn eat(&mut self, kind: Kind) -> bool {
        if self.at(kind) {
            self.advance();
            return true;
        }
        false
    }

    /// 移动到下一个标记
    fn advance(&mut self) {
        let token = self.lexer.next_token();
        self.prev_token_end = self.cur_token.end;
        self.cur_token = token;
    }
}
```

## 解析函数

`DebuggerStatement`是最简单的语句解析，让我们尝试解析它并返回一个有效的程序。

```rust
impl<'a> Parser<'a> {
    pub fn parse(&mut self) -> Program {
        let stmt = self.parse_debugger_statement();
        let body = vec![stmt];
        Program {
            node: Node {
                start: 0,
                end: self.source.len(),
            },
            body,
        }
    }

    fn parse_debugger_statement(&mut self) -> Statement {
        let node = self.start_node();
        // 注意：从词法分析器返回的标记是`Kind::Debugger`，我们稍后将修复这个问题。
        self.bump_any();
        Statement::DebuggerStatement {
            node: self.finish_node(node),
        }
    }
}
```

所有其他解析函数都建立在这些基本辅助函数之上，例如在swc中解析`while`语句：

```rust reference
https://github.com/swc-project/swc/blob/554b459e26b24202f66c3c58a110b3f26bbd13cd/crates/swc_ecma_parser/src/parser/stmt.rs#L952-L970
```

## 解析表达式

表达式的语法嵌套深且递归，这可能会导致长表达式时出现堆栈溢出（例如在[这个TypeScript测试](https://github.com/microsoft/TypeScript/blob/main/tests/cases/compiler/binderBinaryExpressionStressJs.ts)中）。

为了避免递归，我们可以使用一种称为“Pratt Parsing”的技术。可以在这里找到更深入的教程[Pratt Parsing](https://matklad.github.io/2020/04/13/simple-but-powerful-pratt-parsing.html)，作者是Rust-Analyzer的作者。
Rome中的Rust版本在[Rome](https://github.com/rome/tools/blob/5a059c0413baf1d54436ac0c149a829f0dfd1f4d/crates/rome_js_parser/src/syntax/expr.rs#L442)。

## 列表

有许多地方我们需要解析以标点分隔的列表，例如`[a, b, c]`或`{a, b, c}`。

解析列表的代码都很相似，我们可以使用[模板方法模式](https://en.wikipedia.org/wiki/Template_method_pattern)通过使用特征来避免重复。

```rust reference
https://github.com/rome/tools/blob/85ddb4b2c622cac9638d5230dcefb6cf571677f8/crates/rome_js_parser/src/parser/parse_lists.rs#L131-L157
```

该模式还可以防止我们进入无限循环，特别是`progress.assert_progressing(p);`。

然后可以为不同的列表提供实现细节，例如：

```rust reference
https://github.com/rome/tools/blob/85ddb4b2c622cac9638d5230dcefb6cf571677f8/crates/rome_js_parser/src/syntax/expr.rs#L1543-L1580
```

## 覆盖语法

在[覆盖语法](/blog/grammar#cover-grammar)中详细说明了，有时我们需要将`Expression`转换为`BindingIdentifier`。像JavaScript这样的动态语言可以简单地重写节点类型：

```javascript reference
https://github.com/acornjs/acorn/blob/11735729c4ebe590e406f952059813f250a4cbd1/acorn/src/lval.js#L11-L26
```

但在Rust中，我们需要进行结构到结构的转换。一个干净而好的方法是使用特征。

```rust
pub trait CoverGrammar<'a, T>: Sized {
    fn cover(value: T, p: &mut Parser<'a>) -> Result<Self>;
}
```

该特征接受`T`作为输入类型，`Self`作为输出类型，因此我们可以定义以下内容：

```rust
impl<'a> CoverGrammar<'a, Expression<'a>> for BindingPattern<'a> {
    fn cover(expr: Expression<'a>, p: &mut Parser<'a>) -> Result<Self> {
        match expr {
            Expression::Identifier(ident) => Self::cover(ident.unbox(), p),
            Expression::ObjectExpression(expr) => Self::cover(expr.unbox(), p),
            Expression::ArrayExpression(expr) => Self::cover(expr.unbox(), p),
            _ => Err(()),
        }
    }
}

impl<'a> CoverGrammar<'a, ObjectExpression<'a>> for BindingPattern<'a> {
    fn cover(obj_expr: ObjectExpression<'a>, p: &mut Parser<'a>) -> Result<Self> {
        ...
        BindingIdentifier::ObjectPattern(ObjectPattern { .. })
    }
}

impl<'a> CoverGrammar<'a, ArrayExpression<'a>> for BindingPattern<'a> {
    fn cover(expr: ArrayExpression<'a>, p: &mut Parser<'a>) -> Result<Self> {
        ...
        BindingIdentifier::ArrayPattern(ArrayPattern { .. })
    }
}
```

然后，在任何需要将`Expression`转换为`BindingPattern`的地方，调用`BindingPattern::cover(expression)`。
