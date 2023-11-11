---
id: parser
title: 構文解析器 (パーサー)
---

私たちが構築しようとしているパーサーは、[再帰下降構文解析](https://en.wikipedia.org/wiki/Recursive_descent_parser) と呼ばれ、文法を下降して AST を構築する手法です。

パーサーはソースコード、レキサー、レキサーから返された現在のトークンを保持します。

```rust
pub struct Parser<'a> {
    /// ソースコード
    source: &'a str,

    lexer: Lexer<'a>,

    /// レキサーから返された現在のトークン
    cur_token: Token,

    /// 前のトークンの終了範囲
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

## ヘルパー関数

現在のトークン `cur_token: Token` は、レキサーから返された現在のトークンを保持しています。
このトークンをナビゲートしたり調査するためのヘルパー関数を追加して、パーサーコードをよりクリーンにします。

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

    /// 現在のインデックスが `Kind` のトークンかどうかをチェックします
    fn at(&self, kind: Kind) -> bool {
        self.cur_kind() == kind
    }

    /// `Kind` にいる場合に進めます
    fn bump(&mut self, kind: Kind) {
        if self.at(kind) {
            self.advance();
        }
    }

    /// 任意のトークンを進めます
    fn bump_any(&mut self) {
        self.advance();
    }

    /// `Kind` にいる場合に進めて、true を返します。それ以外の場合は false を返します
    fn eat(&mut self, kind: Kind) -> bool {
        if self.at(kind) {
            self.advance();
            return true;
        }
        false
    }

    /// 次のトークンに移動します
    fn advance(&mut self) {
        let token = self.lexer.next_token();
        self.prev_token_end = self.cur_token.end;
        self.cur_token = token;
    }
}
```

## parse 関数

`DebuggerStatement` はパースするのが最も簡単な文なので、パースして有効なプログラムを返してみましょう。

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
        // 注意: レキサーから返されるトークンは `Kind::Debugger` ですが、後で修正します。
        self.bump_any();
        Statement::DebuggerStatement {
            node: self.finish_node(node),
        }
    }
}
```

他のすべてのパース関数は、これらの基本的なヘルパー関数を基にして構築されます。
たとえば、swcの `while` 文をパースする場合は次のようになります。

```rust reference
https://github.com/swc-project/swc/blob/554b459e26b24202f66c3c58a110b3f26bbd13cd/crates/swc_ecma_parser/src/parser/stmt.rs#L952-L970
```

## 式のパース

式の文法は深くネストされており、再帰的です。
これは、長い式（たとえば、[このTypeScriptのテスト](https://github.com/microsoft/TypeScript/blob/main/tests/cases/compiler/binderBinaryExpressionStressJs.ts)）でスタックオーバーフローを引き起こす可能性があります。

再帰を避けるために、Prattパーシングと呼ばれるテクニックを使用することができます。詳細なチュートリアルは、Rust-Analyzer の作者によって書かれた [こちら](https://matklad.github.io/2020/04/13/simple-but-powerful-pratt-parsing.html) で見つけることができます。
また、Rustのバージョンは [Rome](https://github.com/rome/tools/blob/5a059c0413baf1d54436ac0c149a829f0dfd1f4d/crates/rome_js_parser/src/syntax/expr.rs#L442) で確認できます。

## リスト

区切り記号で区切られたリストをパースする必要がある場所がたくさんあります。たとえば、`[a, b, c]` や `{a, b, c}` です。

リストのパースのコードはすべて似ているため、[テンプレートメソッドパターン](https://en.wikipedia.org/wiki/Template_method_pattern) を使用して重複を避けることができます。

```rust reference
https://github.com/rome/tools/blob/85ddb4b2c622cac9638d5230dcefb6cf571677f8/crates/rome_js_parser/src/parser/parse_lists.rs#L131-L157
```

このパターンは、特に `progress.assert_progressing(p);` のような無限ループを防ぐこともできます。

その後、異なるリストに対して実装の詳細を提供できます。たとえば：

```rust reference
https://github.com/rome/tools/blob/85ddb4b2c622cac9638d5230dcefb6cf571677f8/crates/rome_js_parser/src/syntax/expr.rs#L1543-L1580
```

## Cover Grammar

[Cover Grammar](/blog/grammar#cover-grammar) で詳細に説明されているように、`Expression` を `BindingIdentifier` に変換する必要がある場合があります。JavaScript のような動的言語では、ノードのタイプを単純に書き換えることができます。

```javascript reference
https://github.com/acornjs/acorn/blob/11735729c4ebe590e406f952059813f250a4cbd1/acorn/src/lval.js#L11-L26
```

しかし、Rust では、構造体から構造体への変換を行う必要があります。これを行うためのきれいでシンプルな方法は、トレイトを使用することです。

```rust
pub trait CoverGrammar<'a, T>: Sized {
    fn cover(value: T, p: &mut Parser<'a>) -> Result<Self>;
}
```

このトレイトは、入力型として `T` を受け入れ、出力型として `Self` を受け入れるため、次のように定義できます。

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

その後、`Expression` を `BindingPattern` に変換する必要がある場所では、`BindingPattern::cover(expression)` を呼び出します。
