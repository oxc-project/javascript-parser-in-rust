---
id: lexer
title: 词法分析器 (Lexer)
---

## Token

词法分析器 (lexer)，也称为分词器 (tokenizer) 或扫描器 (scanner)，负责将源文本转换为词元 (tokens)。
这些 token 稍后将被解析器消费，因此我们不必担心原始文本中的空格和注释。

让我们先从简单的开始：将单个 `+` 文本转换为一个 token。

```rust
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Token {
    /// token 类型
    pub kind: Kind,

    /// 源文本中的起始偏移量
    pub start: usize,

    /// 源文本中的结束偏移量
    pub end: usize,
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Kind {
    Eof, // 文件结尾
    Plus,
}
```

对于单个 `+` 会输出：

```
[
    Token { kind: Kind::Plus, start: 0, end: 1 },
    Token { kind: Kind::Eof,  start: 1, end: 1 }
]
```

为了遍历字符串，我们可以如同写 C 代码那样维护一个索引；
又或者我们可以查看 [str 的文档](https://doc.rust-lang.org/std/primitive.str.html#)
并使用 [`Chars`](https://doc.rust-lang.org/std/str/struct.Chars.html) 迭代器。

:::info
`Chars` 迭代器抽象掉了索引的维护和边界检查等细节，让我们写代码的时候充满安全感。

当我们调用 `chars.next()` 时，它会返回 `Option<char>`。
但请注意，`char` 不是 0 到 255 的 ASCII 值，而是一个范围在 0 到 0x10FFFF 之间的 UTF-8 Unicode 码点值。
:::

让我们定义一个初步的词法分析器抽象：

```rust
use std::str::Chars;

struct Lexer<'a> {
    /// 源文本
    source: &'a str,

    /// 剩余的字符
    chars: Chars<'a>
}

impl<'a> Lexer<'a> {
    pub fn new(source: &'a str) -> Self {
        Self {
            source,
            chars: source.chars()
        }
    }
}
```

:::info
这里的生命周期 `'a` 表示迭代器持有对某个地方的引用。在这里，它引用了一个 `&'a str`。
:::

要将源文本转换为 token ，只需不断调用 `chars.next()` 并对返回的 `char`进行模式匹配。
最后一个 token 将始终是 `Kind::Eof`。

```rust
impl<'a> Lexer<'a> {
    fn read_next_kind(&mut self) -> Kind {
        while let Some(c) = self.chars.next() {
            match c {
              '+' => return Kind::Plus,
              _ => {}
            }
        }
        Kind::Eof
    }

    fn read_next_token(&mut self) -> Token {
        let start = self.offset();
        let kind = self.read_next_kind();
        let end = self.offset();
        Token { kind, start, end }
    }

    /// 获取从源文本中的偏移长度，以 UTF-8 字节表示
    fn offset(&self) -> usize {
        self.source.len() - self.chars.as_str().len()
    }
}
```

在 `fn offset` 中，`.len()` 和 `.as_str().len()` 方法看起来像是 O(n) 的，所以让我们进一步看看是否如此。

[`.as_str()`](https://doc.rust-lang.org/src/core/str/iter.rs.html#112) 返回一个指向字符串切片的指针

```rust reference
https://github.com/rust-lang/rust/blob/b998821e4c51c44a9ebee395c91323c374236bbb/library/core/src/str/iter.rs#L112-L115
```

切片 ([slice](https://doc.rust-lang.org/std/slice/index.html))是对一块内存的视图，它通过指针和长度表示。
`.len()` 方法返回切片内部存储的元数据

```rust reference
https://github.com/rust-lang/rust/blob/b998821e4c51c44a9ebee395c91323c374236bbb/library/core/src/str/mod.rs#L157-L159
```

```rust reference
https://github.com/rust-lang/rust/blob/b998821e4c51c44a9ebee395c91323c374236bbb/library/core/src/str/mod.rs#L323-L325
```

```rust reference
https://github.com/rust-lang/rust/blob/b998821e4c51c44a9ebee395c91323c374236bbb/library/core/src/slice/mod.rs#L129-L138
```

上面提到的这两个方法在编译之后都会成为单次数据读取，因此 `.as_str().len()` 实际上是 O(1)的。

## Peek

要对`++`或`+=`等多字符运算符进行分词，需要一个名为`peek`的辅助函数：

```rust
fn peek(&self) -> Option<char> {
    self.chars.clone().next()
}
```

我们不希望直接前移 (advance) 原始的`chars`迭代器，因此我们克隆迭代器后再前移。

:::info
如果我们深入查看[源代码](https://doc.rust-lang.org/src/core/slice/iter.rs.html#148-152)，`clone`操作是非常廉价的，它只是复制了当前索引和索引边界。

```rust reference
https://github.com/rust-lang/rust/blob/b998821e4c51c44a9ebee395c91323c374236bbb/library/core/src/slice/iter.rs#L148-L152
```

:::

`peek`和`chars.next()`的区别在于前者总是返回**相同的**下一个`char`，而后者会前移迭代器并返回不同的`char`。

举例来说，考虑字符串`abc`：

- 重复调用`peek()`会返回`Some(a)`，`Some(a)`，`Some(a)`，...
- 重复调用`chars.next()`会返回`Some('a')`，`Some('b')`，`Some('c')`，`None`。

有了`peek`，对`++`和`+=`进行分词只需要嵌套的if语句。

以下是来自[jsparagus](https://github.com/mozilla-spidermonkey/jsparagus)的真实实现：

```rust reference
https://github.com/mozilla-spidermonkey/jsparagus/blob/master/crates/parser/src/lexer.rs#L1769-L1791
```

上述逻辑实际上适用于所有运算符，因此让我们将学到的知识扩展到对 JavaScript 的词法分析上试试。

## JavaScript

用 Rust 编写的词法分析器相当无聊，感觉就像写 C 代码一样，我们写长长的 if 语句并检查每个`char`，然后返回相应的 token。

对 JavaScript 的词法分析才是真正有趣的部分。

让我们打开[《ECMAScript语言规范》](https://tc39.es/ecma262/)并重新学习 JavaScript。

:::caution
我仍然记得第一次打开规范时，我仅仅偷瞄了几个字就陷入痛苦、泪流满面，因为这就像是阅读到处都是术语黑话的外文文本。所以当你觉得哪里不对劲，可以去看看我的[阅读规范指南](/blog/ecma-spec)。
:::

### 注释

注释 (comments) 没有语义意义，如果我们正在编写运行时，那可以跳过它们；但如果我们正在编写一个 linter 或 bundler，那就不可忽略。

### 标识符和 Unicode

我们大多数时候使用 ASCII 编码，
但是[《ECMAScript语言规范: 源代码》第11章](https://tc39.es/ecma262/#sec-ecmascript-language-source-code) 规定源代码应该使用 Unicode 编码。
而[第 12.6 章 名称和关键字](https://tc39.es/ecma262/#sec-names-and-keywords)规定，标识符 (identifier) 的解释遵循 Unicode 标准附录 31 中给出的默认标识符语法 (Default Identifier Syntax)。
具体来说：

```markup
IdentifierStartChar ::
    UnicodeIDStart

IdentifierPartChar ::
    UnicodeIDContinue

UnicodeIDStart ::
    any Unicode code point with the Unicode property “ID_Start”

UnicodeIDContinue ::
    any Unicode code point with the Unicode property “ID_Continue”
```

这意味着我们可以写`var ಠ_ಠ`，但不能写`var 🦀`，
`ಠ`具有Unicode属性"ID_Start"，而`🦀`则没有。

:::info

我发布了 [unicode-id-start](https://crates.io/crates/unicode-id-start) 这个 crate，用于这个特定目的。
我们可以调用`unicode_id_start::is_id_start(char)`和`unicode_id_start::is_id_continue(char)`来检查 Unicode 。

:::

### 关键字

所有的[关键字](https://tc39.es/ecma262/#sec-keywords-and-reserved-words) (keywords)，比如`if`、`while`和`for`，
都需要视作一个整体进行分词。
它们需要被添加到 token 种类的枚举中，这样我们就不必在解析器中进行字符串比较了。

```rust
pub enum Kind {
    Identifier,
    If,
    While,
    For
}
```

:::caution
`undefined`不是一个关键字，不需要在这里添加。
:::

对关键字进行分词只需匹配上述的标识符。

```rust
fn match_keyword(&self, ident: &str) -> Kind {
    // 所有关键字的长度都在1到10之间
    if ident.len() == 1 || ident.len() > 10 {
        return Kind::Identifier;
    }
    match ident {
        "if" => Kind::If,
        "while" => Kind::While,
        "for" => Kind::For,
        _ => Kind::Identifier
    }
}
```

### Token 的值

在编译器的后续阶段，我们经常需要比较标识符、数字和字符串，
例如在 linter 中对标识符进行测试。

这些值目前以源文本的形式存在。现在让我们将它们转换为 Rust 类型，以便更容易处理。

```rust
pub enum Kind {
    Eof, // 文件结尾
    Plus,
    // highlight-start
    Identifier,
    Number,
    String,
    // highlight-end
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Token {
    /// Token 类型
    pub kind: Kind,

    /// 在源码中的起始偏移量
    pub start: usize,

    /// 在源码中的结束偏移量
    pub end: usize,

    // highlight-next-line
    pub value: TokenValue,
}

#[derive(Debug, Clone, PartialEq)]
pub enum TokenValue {
    None,
    Number(f64),
    String(String),
}
```

当对标识符 `foo` 或字符串 `"bar"` 进行分词时，我们会得到:

```markup
Token { kind: Kind::Identifier, start: 0, end: 2, value: TokenValue::String("foo") }
Token { kind: Kind::String, start: 0, end: 4, value: TokenValue::String("bar") }
```

要将它们转换为 Rust 字符串，先调用 `let s = self.source[token.start..token.end].to_string()`，
然后用 `token.value = TokenValue::String(s)` 保存它。

当我们分词一个数字 `1.23` 时，我们得到一个类似 `Token { start: 0, end: 3 }` 的 token。
要将它转换为 Rust 的 `f64`，我们可以使用字符串的 [`parse`](https://doc.rust-lang.org/std/primitive.str.html#method.parse) 方法，
通过调用 `self.source[token.start..token.end].parse::<f64>()`，然后将值保存到 `token.value` 中。
对于二进制、八进制和整数，可以在 [jsparagus](https://github.com/mozilla-spidermonkey/jsparagus/blob/master/crates/parser/src/numeric_value.rs) 中找到解析它们的方法。

## Rust 优化

### 更小的 Token

若要获得更简单安全的代码，把 token 的值放在 `Kind` 枚举的内部似乎是个非常诱人的选择：

```rust
pub enum Kind {
    Number(f64),
    String(String),
}
```

众所周知，Rust 枚举的字节大小是其所有变体的联合 (union)。
相比原始枚举，这个枚举多了很多字节，而原始枚举只有 1 个字节。
解析器中将会大量使用 `Kind` 枚举，处理 1 个字节的枚举显然比处理多字节枚举更快。

### String Interning

在编译器中使用 `String` 性能并不高，主要是因为：

- `String` 分配在堆上
- `String`的比较是一个 O(n) 的操作

[String Interning](https://en.wikipedia.org/wiki/String_interning) 通过在缓存中只存储每个不同字符串值的一个副本及其唯一标识以解决这些问题。
每个不同标识符或字符串将只有一次堆分配，并且字符串比较变为 O(1)。

在 [crates.io](https://crates.io/search?q=string%20interning) 上有许多 string interning 库，具有不同的优缺点。

在最开始，我们使用[`string-cache`](https://crates.io/crates/string_cache)便已够用，它有一个 `Atom` 类型和一个编译时的 `atom!("string")` 接口。

使用 `string-cache` 后，`TokenValue` 需改为：

```rust
#[derive(Debug, Clone, PartialEq)]
pub enum TokenValue {
    None,
    Number(f64),
    // highlight-next-line
    String(Atom),
}
```

字符串比较则变为 `matches!(value, TokenValue::String(atom!("string")))`。
