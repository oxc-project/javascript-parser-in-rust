---
id: lexer
title: Lexer
---

The lexer, also known as tokenizer or scanner, is responsible for transforming source text to tokens.
The tokens will later be consumed by the parser so we don't need to worry about whitespaces.

Let's start by defining a basic lexer and a single `+` token.

```rust
use std::str::Chars;

struct Lexer<'a> {
  chars: Chars<'a>
}
```

```rust
enum Token {
  Plus,
  Eof
}
```

The `Chars` iterator is a super nice interface for working with strings,
it will give you a `Option<char>` when you call `chars.next()`.
The only thing to be careful is that a `char` is not a 0-255 ascii value,
it is a utf8 unicode point value with the range of 0 to 0x10FFFF.

To convert the source text to tokens, all you need is a loop, and test the return value of each `chars.next()` call.

```rust
fn read_next_token(&mut self) -> Token {
  while let Some(c) = self.chars.next() {
    match c {
      '+' => return Token::Plus,
      _ => {}
    }
  }
  Token::Eof
}
```

---

## JavaScript Lexer

A lexer written in Rust is acutally really boring, it feels like writing C code
where you write long chained if statements and check for each `char` and then return the respective token.

But, the fun begins when you start writing it for JavaScript.

### Specification on Lexical Grammar

### Identifiers: UTF-8 vs UTF-16

### LL(1)

### Re-lex

### Strict Mode

---

## Rust Optimizations

### Jump Table

### Unicode Identifier Start
