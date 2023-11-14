---
id: errors
title: 处理错误
---

以下引用自 [龙书](https://www.amazon.com/Compilers-Principles-Techniques-Tools-2nd/dp/0321486811)：

> 大多数编程语言规范并未描述编译器应该如何响应错误；错误处理留给了编译器设计者。
> 从一开始就规划错误处理不仅可以简化编译器的结构，还能改善其错误处理能力。

无论我们输入什么样的内容，一个完全可恢复 (fully recoverable) 的解析器都能构建出 AST。
对于代码检查器或格式化器之类的工具，人们希望有一个完全可恢复的解析器，这样我们就可以仅仅处理程序的一小部分。

一旦发现语法不匹配，一个崩溃的解析器将中止，而一个部分可恢复的 (partially recoverable)解析器将从确定性语法中恢复。

例如，给定一个语法错误的 while 语句 `while true {}`，我们知道它缺少圆括号，而它唯一可能的标点符号就是圆括号，因此我们仍然可以返回一个有效的 AST，并指示其缺少的括号。

目前大多数 JavaScript 解析器都是部分可恢复的，因此我们也将构建一个部分可恢复的解析器。

:::信息
[Rome](https://github.com/rome/tools) 解析器是一个完全可恢复的解析器。
:::

Rust 使用 `Result` 类型来返回和传播错误。
配合 `?` 语法，解析函数将保持简单清晰。

我们通常会封装 Result 类型，以便稍后替换错误：

```rust
pub type Result<T> = std::result::Result<T, ()>;
```

我们的解析函数将返回一个 Result，例如：

```rust
pub fn parse_binding_pattern(&mut self, ctx: Context) -> Result<BindingPattern<'a>> {
    match self.cur_kind() {
        Kind::LCurly => self.parse_object_binding_pattern(ctx),
        Kind::LBrack => self.parse_array_binding_pattern(ctx),
        kind if kind.is_binding_identifier() => {
          // ... 代码省略
        }
        // highlight-next-line
        _ => Err(()),
    }
}
```

我们可以添加一个 `expect` 函数，用于在当前标记与语法不匹配时返回错误：

```rust
/// 期望一个 `Kind` 或返回错误
pub fn expect(&mut self, kind: Kind) -> Result<()> {
    if !self.at(kind) {
        return Err(())
    }
    self.advance();
    Ok(())
}
```

并如此使用：

```rust
pub fn parse_paren_expression(&mut self, ctx: Context) -> Result<Expression> {
    self.expect(Kind::LParen)?;
    let expression = self.parse_expression(ctx)?;
    self.expect(Kind::RParen)?;
    Ok(expression)
}
```

:::注意

为了完整起见，词法分析函数 `read_next_token` 在词法分析时发现意外的 `char` 时也应返回 `Result`。
:::

### `Error` Trait

为了返回一种特定的错误，我们需要填上 `Result` 的 `Err` 部分：

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

我们称之为 `SyntaxError`，因为在 ECMAScript 规范的语法部分里定义的所有"早期错误 (early errors)"都是语法错误。

为了使其成为一个合适的 `Error`，它需要实现 [`Error` trait](https://doc.rust-lang.org/std/error/trait.Error.html)。为了使代码更清晰，我们可以使用 [`thiserror`](https://docs.rs/thiserror/latest/thiserror) crate 中的宏：

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

然后我们可以添加一个 `expect` 辅助函数，用于在标记不匹配时抛出错误：

```rust
/// 期望一个 `Kind` 或返回错误
pub fn expect(&mut self, kind: Kind) -> Result<()> {
    if self.at(kind) {
        return Err(SyntaxError::UnExpectedToken);
    }
    self.advance(kind);
    Ok(())
}
```

`parse_debugger_statement` 现在可以使用 `expect` 函数进行适当的错误管理：

```rust
fn parse_debugger_statement(&mut self) -> Result<Statement> {
    let node = self.start_node();
    self.expect(Kind::Debugger)?;
    Ok(Statement::DebuggerStatement {
        node: self.finish_node(node),
    })
}
```

请注意，在 `expect` 后面的 `?` 是一种语法糖，称为 ["问号操作符"](https://doc.rust-lang.org/book/ch09-02-recoverable-errors-with-result.html#a-shortcut-for-propagating-errors-the--operator)，用于使函数在 `expect` 返回 `Err` 时提前返回。

### 精美的错误报告

[`miette`](https://docs.rs/miette/latest/miette) 是其中一个最好的错误报告 crate，它提供了精美的彩色输出：

![miette](https://raw.githubusercontent.com/zkat/miette/main/images/serde_json.png)

将 `miette` 添加到你的 `Cargo.toml`：

```toml
[dependencies]
miette = { version = "5", features = ["fancy"] }
```

我们可以用 `miette` 包装我们的 `Error`，而不修改我们的解析器中定义的 `Result` 类型：

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
