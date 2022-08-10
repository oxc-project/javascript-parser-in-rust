---
id: lexer
title: Lexer
---

The lexer, also known as tokenizer or scanner, is responsible for transforming source text to tokens.
The tokens will later be consumed by the parser so we don't need to worry about whitespaces and comments in the original text.

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
or we can take a look at the [string documentation](https://doc.rust-lang.org/std/primitive.str.html#) and find ourself a `Chars` iterator to work with.

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
    chars: Chars<'a>
}
```

:::info
The lifetime `'a` here indicates the iterator has a reference to somewhere, in this case it references to a `&'a str`.
:::

To convert the source text to tokens, we need a simple loop, and test the return value of each `chars.next()` call.

```rust
impl<'a> Lexer<'a> {
    fn read_next_token(&mut self) -> Token {
      while let Some(c) = self.chars.next() {
        match c {
          '+' => return Token::Plus,
          _ => {}
        }
      }
      Token::Eof
    }
}
```

---

## JavaScript

A lexer written in Rust is acutally really boring, it feels like writing C code
where you write long chained if statements and check for each `char` and then return the respective token.

But the fun begins when we start modifying it for JavaScript.

Let's open up the [ECMAScript Language Specification](https://tc39.es/ecma262/) and re-learn JavaScript.

:::caution
I still remember the first time I opened up the specification and went into a corner
and cried for like five minutes because I couldn't understand what was going on.
So please prepare yourself and read my [guide on reading the specification](/blog/ecma-spec).
:::


### Identifiers: UTF-8 vs UTF-16

### LL(1)

### Re-lex

### Strict Mode

---

## Rust Optimizations

### Jump Table

### Unicode Identifier Start

### Small Tokens

### String Interning
