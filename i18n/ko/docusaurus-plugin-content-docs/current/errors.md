---
id: errors
title: Dealing with Errors
---

인용: [Dragon Book](https://www.amazon.com/Compilers-Principles-Techniques-Tools-2nd/dp/0321486811)


> 대부분의 프로그래밍 언어 사양에는 컴파일러가 오류에 어떻게 대응해야 하는지에 대한 설명이 없으며, 오류 처리는 컴파일러 설계자에게 맡겨져 있습니다.
> 처음부터 오류 처리를 계획하면 컴파일러의 구조를 단순화하고 오류 처리를 개선할 수 있습니다.

완전히 복구 가능한 파서는 우리가 어떤 것을 던져도 AST를 구성할 수 있습니다.
linter나 formatter와 같은 도구의 경우, 프로그램 일부에 동작할 수 있도록 완전히 복구 가능한 파서를 원할 것입니다.

패닉 파서는 문법 불일치가 있으면 중단하고, 부분적으로 복구 가능한 파서는 결정론적 문법에서 복구합니다.

예를 들어, 문법적으로 잘못된 동안 문 `while true {}`가 주어지면 대괄호가 누락되었다는 것을 알 수 있습니다,
그리고 포함될 수 있는 유일한 구두점은 대괄호뿐이므로 여전히 유효한 AST를 반환하고 누락된 대괄호를 표시할 수 있습니다.

대부분의 자바스크립트 파서는 부분적으로 복구가 가능하므로, 저희도 마찬가지로 부분적으로 복구 가능한 파서를 만들겠습니다.

:::info
[Rome](https://github.com/rome/tools) 은 완전 복구 가능한 파서입니다.
:::

Rust에는 오류를 반환하고 전파하기 위한 `Result` 타입이 있습니다.
구문 `?`와 함께 사용하면 구문 분석 함수가 간단하고 깔끔하게 유지됩니다.

나중에 오류를 대체할 수 있도록 결과 타입을 래핑하는 것이 일반적입니다:

```rust
pub type Result<T> = std::result::Result<T, ()>;
```

예를 들어 파싱 함수는 Result를 반환합니다:

```rust
pub fn parse_binding_pattern(&mut self, ctx: Context) -> Result<BindingPattern<'a>> {
    match self.cur_kind() {
        Kind::LCurly => self.parse_object_binding_pattern(ctx),
        Kind::LBrack => self.parse_array_binding_pattern(ctx),
        kind if kind.is_binding_identifier() => {
          // ... code omitted
        }
        // highlight-next-line
        _ => Err(()),
    }
}
```

현재 토큰이 문법과 일치하지 않을 경우 오류를 반환하는 `expect` 함수를 추가할 수 있습니다:

```rust
/// Expect a `Kind` or return error
pub fn expect(&mut self, kind: Kind) -> Result<()> {
    if !self.at(kind) {
        return Err(())
    }
    self.advance();
    Ok(())
}
```

이대로 사용해보세요:

```rust
pub fn parse_paren_expression(&mut self, ctx: Context) -> Result<Expression> {
    self.expect(Kind::LParen)?;
    let expression = self.parse_expression(ctx)?;
    self.expect(Kind::RParen)?;
    Ok(expression)
}
```

:::note

lexing 안에 예상치 못한 `char`가 발견되는 경우.
완전성을 위해, lexer 함수 `read_next_token`은 예상치 못한 `문자`가 발견될 때 `Result`도 반환해야 합니다.

:::

### The `Error` Trait

특정 오류를 반환하려면 `Result`의 `Err` 부분을 채워야 합니다:

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

ECMAScript 사양의 문법 섹션에 정의된 모든 "early error"는 구문 오류이므로 이를 `SyntaxError`라고 부릅니다.

이를 제대로 된 `Error`로 만들려면 [`Error` Trait](https://doc.rust-lang.org/std/error/trait.Error.html)를 구현해야 합니다. 더 깔끔한 코드를 위해 [`thiserror`](https://docs.rs/thiserror/latest/thiserror) crate에서 매크로를 사용할 수 있습니다:

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

그런 다음 토큰이 일치하지 않을 경우 오류를 던지는 `expect` 헬퍼 함수를 추가할 수 있습니다:

```rust
/// Expect a `Kind` or return error
pub fn expect(&mut self, kind: Kind) -> Result<()> {
    if self.at(kind) {
        return Err(SyntaxError::UnExpectedToken);
    }
    self.advance(kind);
    Ok(())
}
```

`parse_debugger_statement`가 `expect` 함수를 사용할 수 있게되어 적절한 오류를 관리할 수 있습니다:

```rust
fn parse_debugger_statement(&mut self) -> Result<Statement> {
    let node = self.start_node();
    self.expect(Kind::Debugger)?;
    Ok(Statement::DebuggerStatement {
        node: self.finish_node(node),
    })
}
```

`expect` 뒤에 있는 `?`를 보세요,
이것은 syntactic sugar ["question mark operator"](https://doc.rust-lang.org/book/ch09-02-recoverable-errors-with-result.html#a-shortcut-for-propagating-errors-the--operator)으로 `expect` 함수가 `Err`를 반환하는 경우에 함수를 조기에 반환하는 것입니다.

### Fancy Error Report

[`miette`](https://docs.rs/miette/latest/miette)는 가장 멋진 오류 보고 crete 중 하나입니다,
멋진 색상의 출력을 제공합니다.

![miette](https://raw.githubusercontent.com/zkat/miette/main/images/serde_json.png)

`miette`를 우리 `Cargo.toml`에 추가해보죠

```toml
[dependencies]
miette = { version = "5", features = ["fancy"] }
```

`Error`를 `miette`로 감쌈으로 파서에 정의된 `Result` 타입을 수정하지 않아도 됩니다.

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
