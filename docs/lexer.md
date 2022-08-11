---
id: lexer
title: Lexer
---

The lexer, also known as tokenizer or scanner, is responsible for transforming source text to tokens.
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

A single `+` will give you `[Token { kind: Kind::Plus, start: 0, end: 1 }, Token { kind: Kind::Eof, start: 1, end: 1 }]`

To loop through the string, we can either keep track of an index and pretend that we are writing C code,
or we can take a look at the [string documentation](https://doc.rust-lang.org/std/primitive.str.html#)
and find our self a [`Chars`](https://doc.rust-lang.org/std/str/struct.Chars.html) iterator to work with.

:::info
The `Chars` iterator abstracts away the tracking index and boundary checking to make you feel really safe.

It gives you an `Option<char>` when you call `chars.next()`.
But please note that a `char` is not a 0-255 ascii value,
it is a utf8 unicode point value with the range of 0 to 0x10FFFF.
:::

Let's define a starter lexer abstraction

```rust
use std::str::Chars;

struct Lexer<'a> {
    /// Source Text
    source: &'a str,

    /// Length of the original input string, in UTF-8 bytes
    source_length: usize,

    chars: Chars<'a>
}

impl<'a> Lexer<'a> {
    pub fn new(source: &'a str) -> Self {
        Self {
            source,
            source_length: source.len(),
            chars: source.chars()
        }
    }
}
```

:::info
The lifetime `'a` here indicates the iterator has a reference to somewhere, in this case it references to a `&'a str`.
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
        let start = self.source_length - self.current.chars.as_str().len();
        let kind = self.read_next_kind();
        let end = self.source_length - self.current.chars.as_str().len();
        Token { kind, start, end }
    }
}
```

### Peek

Moving on to tokenizing `++` and `+=`, we need a helper function called `peek`.

```rust
    fn peek(&self) -> Option<char> {
        self.chars.clone().next()
    }
```

:::info
The `clone` is cheap here, if you dig into the [source code](https://doc.rust-lang.org/src/core/slice/iter.rs.html#148-152),

```rust
    fn clone(&self) -> Self {
        Iter { ptr: self.ptr, end: self.end, _marker: self._marker }
    }
```

you can see that it just copies the tracking index and the boundary.
:::

Equipped with `peek`, tokenizing `++` and `+=` are just a simple nested if statements.

Here is a real world implementation from [jsparagus](https://github.com/mozilla-spidermonkey/jsparagus):

```rust reference
https://github.com/mozilla-spidermonkey/jsparagus/blob/master/crates/parser/src/lexer.rs#L1769-L1791
```

The above logic applies for all operators, so let's expand our knowledge on lexing JavaScript.

---

## Lexing JavaScript

A lexer written in Rust is really boring, it feels like writing C code
where you write long chained if statements and check for each `char` and then return the respective token.

The real fun begins when we start lexing for JavaScript.

Let's open up the [ECMAScript Language Specification](https://tc39.es/ecma262/) and re-learn JavaScript.

:::caution
I still remember the first time I opened up the specification and went into a little corner
and cried in agony because it feels like reading foreign text with jargons everywhere.
So head over to my [guide on reading the specification](/blog/ecma-spec) if you are getting lost.
:::

### Identifiers and Unicode

We mostly code in ascii,
but [Chapter 11 ECMAScript Language: Source Text](https://tc39.es/ecma262/#sec-ecmascript-language-source-code)
states the source text should be in Unicode.
And [Chapter 12.6 Names and Keywords](https://tc39.es/ecma262/#sec-names-and-keywords)
states the identifiers are interpreted according to the Default Identifier Syntax given in Unicode Standard Annex #31.
Specifically,

```markup
UnicodeIDStart ::
    any Unicode code point with the Unicode property “ID_Start”
UnicodeIDContinue ::
    any Unicode code point with the Unicode property “ID_Continue”
```

This means that we can write `var ಠ_ಠ` but not `var 🦀` because `ಠ_ಠ` has "ID_Start".

I published the [unicode-id-start](https://crates.io/crates/unicode-id-start) for this exact purpose,
and you can call `unicode_id_start::is_id_start(char)` and `unicode_id_start::is_id_continue(char)` in your lexer for checking unicode.

### LL(1)

### Re-lex

### Strict Mode

---

## Rust Optimizations

### Jump Table

### Unicode Identifier Start

### Small Tokens

### String Interning
