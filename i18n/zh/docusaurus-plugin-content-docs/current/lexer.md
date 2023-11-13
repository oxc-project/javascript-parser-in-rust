---
id: lexer
title: Lexer
---

## Token

词法分析器，也称为分词器 (tokenizer) 或扫描器 (scanner)，负责将源代码文本转换为词元（tokens）。
这些 token 稍后将被解析器消耗，因此我们不必担心原始文本中的空格和注释。

让我们从简单的开始：将单个 `+` 文本转换为一个 token。

```rust
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Token {
    /// 标记类型
    pub kind: Kind,

    /// 源文本中的起始偏移量
    pub start: usize,

    /// 源文本中的结束偏移量
    pub end: usize,
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Kind {
    Eof, // 文件结束
    Plus,
}
```

单个 `+` 会输出：

```
[
    Token { kind: Kind::Plus, start: 0, end: 1 },
    Token { kind: Kind::Eof,  start: 1, end: 1 }
]
```

为了遍历字符串，我们可以如同写 C 代码那样维护一个索引；
又或者我们可以查看 [字符串文档](https://doc.rust-lang.org/std/primitive.str.html#)
并找到一个 [`Chars`](https://doc.rust-lang.org/std/str/struct.Chars.html) 迭代器来使用。

:::info
`Chars` 迭代器抽象掉了索引的维护和边界检查等细节，让我们写代码的时候充满安全感。

当我们调用 `chars.next()` 时，它会返回 `Option<char>`。
但请注意，`char` 不是 0-255 的 ASCII 值，它是一个范围在 0 到 0x10FFFF 之间的 utf8 Unicode 码点值。
:::

让我们定义一个初步的词法分析器抽象

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
这里的生命周期 `'a` 表示迭代器引用了某个地方。在这里，它引用了一个 `&'a str`。
:::

要将源文本转换为 token ，只需不断调用 `chars.next()` 并对返回的 `char`进行模式匹配。
最后一个 token 将始终是 `Kind::Eof`。

网络连接超时，正在自动重试~

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

一个切片 ([slice](https://doc.rust-lang.org/std/slice/index.html))是作为指针和长度表示的内存块的视图。
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

上面提到的这些方法在编译之后都会成为单次数据访问，因此 `.as_str().len()` 实际上是 O(1)的。

## Peek

To tokenize multi-character operators such as `++` or `+=`, a helper function `peek` is required:

```rust
fn peek(&self) -> Option<char> {
    self.chars.clone().next()
}
```

We don't want to advance the original `chars` iterator so we clone the iterator and advance the index.

:::info
The `clone` is cheap if we dig into the [source code](https://doc.rust-lang.org/src/core/slice/iter.rs.html#148-152),
it just copies the tracking and boundary index.

```rust reference
https://github.com/rust-lang/rust/blob/b998821e4c51c44a9ebee395c91323c374236bbb/library/core/src/slice/iter.rs#L148-L152
```

:::

The difference between `peek` and `chars.next()` is the former will always return the **same** next `char`,
while the later will move forward and return a different `char`.

To demonstrate, consider the string `abc`:

- repeated `peek()` call returns `Some(a)`, `Some(a)`, `Some(a)`, ...
- repeated `chars.next()` call returns `Some('a')`, `Some('b')`, `Some('c')`, `None`.

Equipped with `peek`, tokenizing `++` and `+=` are just nested if statements.

Here is a real-world implementation from [jsparagus](https://github.com/mozilla-spidermonkey/jsparagus):

```rust reference
https://github.com/mozilla-spidermonkey/jsparagus/blob/master/crates/parser/src/lexer.rs#L1769-L1791
```

The above logic applies to all operators, so let us expand our knowledge on lexing JavaScript.

## JavaScript

A lexer written in Rust is rather boring, it feels like writing C code
where we write long chained if statements and check for each `char` and then return the respective token.

The real fun begins when we start lexing for JavaScript.

Let's open up the [ECMAScript Language Specification](https://tc39.es/ecma262/) and re-learn JavaScript.

:::caution
I still remember the first time I opened up the specification and went into a little corner
and cried in agony because it feels like reading foreign text with jargons everywhere.
So head over to my [guide on reading the specification](/blog/ecma-spec) if things don't make sense.
:::

### Comments

Comments have no semantic meaning, they can be skipped if we are writing a runtime,
but they need to be taken into consideration if we are writing a linter or a bundler.

### Identifiers and Unicode

We mostly code in ASCII,
but [Chapter 11 ECMAScript Language: Source Text](https://tc39.es/ecma262/#sec-ecmascript-language-source-code)
states the source text should be in Unicode.
And [Chapter 12.6 Names and Keywords](https://tc39.es/ecma262/#sec-names-and-keywords)
states the identifiers are interpreted according to the Default Identifier Syntax given in Unicode Standard Annex #31.
In detail:

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

This means that we can write `var ಠ_ಠ` but not `var 🦀`,
`ಠ` has the Unicode property "ID_Start" while `🦀` does not.

:::info

I published the [unicode-id-start](https://crates.io/crates/unicode-id-start) crate for this exact purpose.
`unicode_id_start::is_id_start(char)` and `unicode_id_start::is_id_continue(char)` can be called to check Unicode.

:::

### Keywords

All the [keywords](https://tc39.es/ecma262/#sec-keywords-and-reserved-words) such as `if`, `while` and `for`
need to be tokenized and interpreted as a whole.
They need to be added to the token kind enum so we don't have to make string comparisons in the parser.

```rust
pub enum Kind {
    Identifier,
    If,
    While,
    For
}
```

:::caution
`undefined` is not a keyword, it is unnecessary to add it here.
:::

Tokenizing keywords will just be matching the identifier from above.

```rust
fn match_keyword(&self, ident: &str) -> Kind {
    // all keywords are 1 <= length <= 10
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

### Token Value

We often need to compare identifiers, numbers and strings in later stages of the compiler phases,
for example testing against identifiers inside a linter,

These values are currently in plain source text,
let's convert them to Rust types so they are easier to work with.

```rust
pub enum Kind {
    Eof, // end of file
    Plus,
    // highlight-start
    Identifier,
    Number,
    String,
    // highlight-end
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Token {
    /// Token Type
    pub kind: Kind,

    /// Start offset in source
    pub start: usize,

    /// End offset in source
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

When an identifier `foo` or string `"bar"` is tokenized , we get

```markup
Token { kind: Kind::Identifier, start: 0, end: 2, value: TokenValue::String("foo") }
Token { kind: Kind::String, start: 0, end: 4, value: TokenValue::String("bar") }
```

To convert them to Rust strings, call `let s = self.source[token.start..token.end].to_string()`
and save it with `token.value = TokenValue::String(s)`.

When we tokenized a number `1.23`, we get a token with `Token { start: 0, end: 3 }`.
To convert it to Rust `f64`, we can use the string [`parse`](https://doc.rust-lang.org/std/primitive.str.html#method.parse)
method by calling `self.source[token.start..token.end].parse::<f64>()`, and then save the value into `token.value`.
For binary, octal and integers, an example of their parsing techniques can be found in [jsparagus](https://github.com/mozilla-spidermonkey/jsparagus/blob/master/crates/parser/src/numeric_value.rs).

## Rust Optimizations

### Smaller Tokens

It is tempting to put the token values inside the `Kind` enum and aim for simpler and safer code:

```rust
pub enum Kind {
    Number(f64),
    String(String),
}
```

But it is known that the byte size of a Rust enum is the union of all its variants.
This enum packs a lot of bytes compared to the original enum, which has only 1 byte.
There will be heavy usages of this `Kind` enum in the parser,
dealing with a 1 byte enum will obviously be faster than a multi-byte enum.

### String Interning

It is not performant to use `String` in compilers, mainly due to:

- `String` is a heap allocated object
- String comparison is an O(n) operation

[String Interning](https://en.wikipedia.org/wiki/String_interning) solves these problems by
storing only one copy of each distinct string value with a unique identifier in a cache.
There will only be one heap allocation per distinct identifier or string, and string comparisons become O(1).

There are lots of string interning libraries on [crates.io](https://crates.io/search?q=string%20interning)
with different pros and cons.

A sufficient starting point is to use [`string-cache`](https://crates.io/crates/string_cache),
it has an `Atom` type and a compile time `atom!("string")` interface.

With `string-cache`, `TokenValue` becomes

```rust
#[derive(Debug, Clone, PartialEq)]
pub enum TokenValue {
    None,
    Number(f64),
    // highlight-next-line
    String(Atom),
}
```

and string comparison becomes `matches!(value, TokenValue::String(atom!("string")))`.
