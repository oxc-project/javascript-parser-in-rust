---
id: errors
title: エラー処理
---

[Dragon Book](https://www.amazon.com/Compilers-Principles-Techniques-Tools-2nd/dp/0321486811) から引用します。

> Most programming language specifications do not describe how a compiler should respond to errors; error handling is left to the compiler designer. Planning the error handling right from the start can both simplify the structure of a compiler and improve its handling of errors.

完全に回復可能なパーサーは、何を投げても AST を構築することができます。
リンターやフォーマッタなどのツールでは、部分的に回復可能なパーサーが望まれるため、プログラムの一部に対して操作を行うことができます。

パニックするパーサーは、文法の不一致がある場合に中断し、部分的に回復可能なパーサーは決定的な文法から回復します。

例えば、文法的に正しくない while 文 `while true {}` が与えられた場合、丸括弧が欠落していることがわかります。
そして、唯一の句読点は丸括弧であるため、有効なASTを返し、欠落している括弧を示すことができます。

ほとんどの JavaScript パーサーは部分的に回復可能ですので、同じように部分的に回復可能なパーサーを構築します。

:::info
[Rome](https://github.com/rome/tools) パーサーは完全に回復可能なパーサーです。
:::

Rustにはエラーを返して伝播させるための `Result` 型があります。
`?` 構文と組み合わせて、パース関数はシンプルでクリーンなままになります。

エラーを後で置き換えるために、通常は Result 型をラップします。

```rust
pub type Result<T> = std::result::Result<T, ()>;
```

例えば、パース関数は Result を返します。

```rust
pub fn parse_binding_pattern(&mut self, ctx: Context) -> Result<BindingPattern<'a>> {
    match self.cur_kind() {
        Kind::LCurly => self.parse_object_binding_pattern(ctx),
        Kind::LBrack => self.parse_array_binding_pattern(ctx),
        kind if kind.is_binding_identifier() => {
          // ... コードは省略
        }
        // highlight-next-line
        _ => Err(()),
    }
}
```

文法に一致しない場合にエラーを返すための `expect` 関数を追加できます。

```rust
/// `Kind`を期待するかエラーを返す
pub fn expect(&mut self, kind: Kind) -> Result<()> {
    if !self.at(kind) {
        return Err(())
    }
    self.advance();
    Ok(())
}
```

以下のように使用します。

```rust
pub fn parse_paren_expression(&mut self, ctx: Context) -> Result<Expression> {
    self.expect(Kind::LParen)?;
    let expression = self.parse_expression(ctx)?;
    self.expect(Kind::RParen)?;
    Ok(expression)
}
```

:::note

完全性のために、字句解析時に予期しない `char` が見つかった場合にも、字句解析関数 `read_next_token` は `Result` を返すべきです。

:::

### Error トレイト

特定のエラーを返すためには、`Result` の `Err` 部分を埋める必要があります。

```rust
pub type Result<T> = std::result::Result<T, SyntaxError>;
                                            ^^^^^^^^^^^
#[derive(Debug)]
pub enum SyntaxError {
    UnexpectedToken(String),
    AutoSemicolonInsertion(String),
    UnterminatedMultiLineComment(String),
}
```

これを `SyntaxError` と呼びます。なぜなら、ECMAScript 仕様の文法セクションで定義されているすべての「早期エラー」は構文エラーだからです。

これを正しい `Error` にするためには、[`Error` トレイト](https://doc.rust-lang.org/std/error/trait.Error.html)を実装する必要があります。よりクリーンなコードのために、[`thiserror`](https://docs.rs/thiserror/latest/thiserror) クレートのマクロを使用できます。

```rust
#[derive(Debug, Error)]
pub enum SyntaxError {
    #[error("Unexpected Token")]
    UnexpectedToken,

    #[error("Expected a semicolon or an implicit semicolon after a statement, but found none")]
    AutoSemicolonInsertion,

    #[error("Unterminated multi-line comment")]
    UnterminatedMultiLineComment,
}
```

その後、トークンが一致しない場合にエラーをスローするための `expect` ヘルパー関数を追加できます。

```rust
/// `Kind`を期待するかエラーを返す
pub fn expect(&mut self, kind: Kind) -> Result<()> {
    if self.at(kind) {
        return Err(SyntaxError::UnExpectedToken);
    }
    self.advance(kind);
    Ok(())
}
```

`parse_debugger_statement` は、適切なエラー管理のために `expect` 関数を使用できるようになります。

```rust
fn parse_debugger_statement(&mut self) -> Result<Statement> {
    let node = self.start_node();
    self.expect(Kind::Debugger)?;
    Ok(Statement::DebuggerStatement {
        node: self.finish_node(node),
    })
}
```

`expect` の後に `?` があることに注意してください。
これは、`expect` 関数が `Err` を返した場合に関数が早期にリターンするための構文糖です。

### Fancy Error Report

[`miette`](https://docs.rs/miette/latest/miette) は最も素敵なエラーレポートクレートの 1 つであり、
視覚的に洗練された出力を提供します。

![miette](https://raw.githubusercontent.com/zkat/miette/main/images/serde_json.png)

`Cargo.toml` に `miette` を追加します。

```toml
[dependencies]
miette = { version = "5", features = ["fancy"] }
```

`Error` を `miette` でラップし、パーサーで定義された `Result` 型を変更せずにできます。

```rust
pub fn main() -> Result<()> {
    let source_code = "".to_string();
    let file_path = "test.js".to_string();
    let mut parser = Parser::new(&source_code);
    parser.parse().map_err(|error| {
        miette::Error::new(error).with_source_code(miette::NamedSource::new(file_path, source_code))
    })
}
```
