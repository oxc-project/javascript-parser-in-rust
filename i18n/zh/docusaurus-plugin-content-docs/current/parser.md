---
id: parser
title: 解析器 (Parser)
---

我们将要构建的解析器称为[递归下降解析器](https://en.wikipedia.org/wiki/Recursive_descent_parser)，它是一个手动过程，顺着语法逐步构建AST。

解析器起初很简单，它持有源代码、词法分析器和从词法分析器中获取的当前 token。

```rust
pub struct Parser<'a> {
    /// 源代码
    source: &'a str,

    lexer: Lexer<'a>,

    /// 从词法分析器中获取的当前 token
    cur_token: Token,

    /// 前一个 token 的结束位置
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

`cur_token: Token`保存了从词法分析器返回的当前 token 。
为了使解析器代码更清晰，我们会添加一些辅助函数来在 token 间移动和检查 token。

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

    /// 检查当前 token 是否具有给定`Kind`
    fn at(&self, kind: Kind) -> bool {
        self.cur_kind() == kind
    }

    /// 如果我们在`Kind`处，则前进
    fn bump(&mut self, kind: Kind) {
        if self.at(kind) {
            self.advance();
        }
    }

    /// 不论当前 token 为何，无条件前进
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

    /// 移动到下一个 token
    fn advance(&mut self) {
        let token = self.lexer.next_token();
        self.prev_token_end = self.cur_token.end;
        self.cur_token = token;
    }
}
```

## 解析函数

`DebuggerStatement`这个语句，解析起来最简单。让我们尝试解析它并返回一个有效的 `Program`：

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
        // 注意：从词法分析器返回的 token 是`Kind::Debugger`，我们稍后将修复这个问题。
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

表达式的语法嵌套深且递归，这可能会导致长表达式时出现堆栈溢出（例如[这个 TypeScript 测试](https://github.com/microsoft/TypeScript/blob/main/tests/cases/compiler/binderBinaryExpressionStressJs.ts)）。

为了避免递归，我们可以使用"Pratt Parsing"。可以在这里找到更深入的教程[Pratt Parsing](https://matklad.github.io/2020/04/13/simple-but-powerful-pratt-parsing.html)，此文作者同时也是Rust-Analyzer的作者。
Rome中的Rust版本在[Rome](https://github.com/rome/tools/blob/5a059c0413baf1d54436ac0c149a829f0dfd1f4d/crates/rome_js_parser/src/syntax/expr.rs#L442)。

## 列表

有许多地方需要解析以标点分隔的列表，例如`[a, b, c]`和`{a, b, c}`。

解析列表的代码大同小异，我们可以使用[模板方法模式](https://en.wikipedia.org/wiki/Template_method_pattern)通过使用 trait 来避免重复。

```rust reference
https://github.com/rome/tools/blob/85ddb4b2c622cac9638d5230dcefb6cf571677f8/crates/rome_js_parser/src/parser/parse_lists.rs#L131-L157
```

该模式还可以防止我们进入无限循环，特别是`progress.assert_progressing(p);`。

接着，我们可以为不同种类的列表各自提供实现，例如：

```rust reference
https://github.com/rome/tools/blob/85ddb4b2c622cac9638d5230dcefb6cf571677f8/crates/rome_js_parser/src/syntax/expr.rs#L1543-L1580
```

## 覆盖语法

我们在[覆盖语法](/blog/grammar#cover-grammar)中详细介绍过，有时我们需要将`Expression`转换为`BindingIdentifier`。若使用JavaScript这样的动态语言，则可以简单地重写节点类型：

```javascript reference
https://github.com/acornjs/acorn/blob/11735729c4ebe590e406f952059813f250a4cbd1/acorn/src/lval.js#L11-L26
```

但在Rust中，我们需要进行 struct 到 struct 的转换。一个巧妙而简洁的方法是使用 trait。

```rust
pub trait CoverGrammar<'a, T>: Sized {
    fn cover(value: T, p: &mut Parser<'a>) -> Result<Self>;
}
```

该 trait 接受`T`作为输入类型，`Self`作为输出类型，因此我们可以定义以下内容：

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
