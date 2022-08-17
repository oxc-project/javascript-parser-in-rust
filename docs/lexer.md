---
id: lexer
title: Lexer
---

## Token

The lexer, also known as tokenizer or scanner, is responsible for transforming source text into tokens.
The tokens will later be consumed by the parser so we don't need to worry about whitespaces and comments from the original text.

Let's start simple and transform a single `+` text into a token.

```rust
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Token {
    /// Token Type
    pub kind: Kind,

    /// Start offset in source
    pub start: usize,

    /// End offset in source
    pub end: usize,
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Kind {
    Eof, // end of file
    Plus,
}
```

A single `+` will give us `[Token { kind: Kind::Plus, start: 0, end: 1 }, Token { kind: Kind::Eof, start: 1, end: 1 }]`

To loop through the string, we can either keep track of an index and pretend that we are writing C code,
or we can take a look at the [string documentation](https://doc.rust-lang.org/std/primitive.str.html#)
and find ourselves a [`Chars`](https://doc.rust-lang.org/std/str/struct.Chars.html) iterator to work with.

:::info
The `Chars` iterator abstracts away the tracking index and boundary checking to make us feel truly safe.

It gives us an `Option<char>` when we call `chars.next()`.
But please note that a `char` is not a 0-255 ASCII value,
it is a utf8 Unicode point value with the range of 0 to 0x10FFFF.
:::

Let's define a starter lexer abstraction

```rust
use std::str::Chars;

struct Lexer<'a> {
    /// Source Text
    source: &'a str,

    /// The remaining characters
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
The lifetime `'a` here indicates the iterator has a reference to somewhere, it references to a `&'a str` in this case.
:::

To convert the source text to tokens, just keep calling `chars.next()` and match on the returned `char`s.
The final token will always be `Kind::Eof`.

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

    /// Get the length offset from the source text, in UTF-8 bytes
    fn offset(&self) -> usize {
        self.source.len() - self.current.chars.as_str().len()
    }
}
```

The `.len()` and `.as_str().len()` method calls inside `fn offset` feel like O(n), so let's dig deeper.

[`.as_str()`](https://doc.rust-lang.org/src/core/str/iter.rs.html#112) returns a pointer to a string slice

```rust reference
https://github.com/rust-lang/rust/blob/b998821e4c51c44a9ebee395c91323c374236bbb/library/core/src/str/iter.rs#L112-L115
```

A [slice](https://doc.rust-lang.org/std/slice/index.html) is a view into a block of memory represented as a pointer and a length.
The `.len()` method returns the meta data stored inside the slice

```rust reference
https://github.com/rust-lang/rust/blob/b998821e4c51c44a9ebee395c91323c374236bbb/library/core/src/str/mod.rs#L157-L159
```

```rust reference
https://github.com/rust-lang/rust/blob/b998821e4c51c44a9ebee395c91323c374236bbb/library/core/src/str/mod.rs#L323-L325
```

```rust reference
https://github.com/rust-lang/rust/blob/b998821e4c51c44a9ebee395c91323c374236bbb/library/core/src/slice/mod.rs#L129-L138
```

All the above code will get compiled into a single data access, so `.as_str().len()` is actually O(1).
Zero cost abstraction indeed!

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

### Whitespace

TODO

### Comments

TODO

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
`ಠ_ಠ` has the Unicode property "ID_Start" while `🦀` does not.

I published the [unicode-id-start](https://crates.io/crates/unicode-id-start) for this exact purpose.
`unicode_id_start::is_id_start(char)` and `unicode_id_start::is_id_continue(char)` can be called to check Unicode.

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
    // all keywords have 1 <= length <= 10
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

We often need to compare numbers and strings in later stages of the compiler phases,
but they are in plain source text right now.
Let's convert them to Rust types so they are easier to work with.

```rust
pub enum Kind {
    // highlight-next-line
    Number,
    // highlight-next-line
    String,
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Token {
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

When we tokenized a string `"foo"`, we get a token with `Token { start: 0, end: 2 }`.
To convert it to Rust string, call `let s = self.source[token.start..token.end].to_string()`
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

[String Interning](https://en.wikipedia.org/wiki/String_interning) solves this problem by
storing only one copy of each distinct string value with a unique identifier in a cache.
There will only be one heap allocation per distinct string, and string comparisons becomes O(1).

There are lots of string interning libraries on [crates.io](https://crates.io/search?q=string%20interning)
with different props and cons.

A starting point is to use [`string-cache`](https://crates.io/crates/string_cache),
it has an `Atom` type and a compile time `atom!("string")` interface.

Our `TokenValue` becomes

```rust
#[derive(Debug, Clone, PartialEq)]
pub enum TokenValue {
    None,
    Number(f64),
    // highlight-next-line
    String(Atom),
}
```

and string comparison becomes `matches!(token, TokenValue::String(atom!("string")))`.
