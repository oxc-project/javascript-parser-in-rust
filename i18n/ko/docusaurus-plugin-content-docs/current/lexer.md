---
id: lexer
title: Lexer
---

## 토큰

토큰라이저나 스캐너로 알려진 Lexer는 소스텍스트를 토큰 변환하는 역할을 갖고 있습니다.
토큰은 나중에 파서에 이용되므로, 원래 텍스트에서 공백이나 주석을 신경쓸 필요가 없습니다.

먼저 간단한 것부터 시작해보고자, `+` 하나 토큰을 변환해봅시다.

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

`+` 하나는 이하와 같습니다.

```
[
    Token { kind: Kind::Plus, start: 0, end: 1 },
    Token { kind: Kind::Eof,  start: 1, end: 1 }
]
```

문자열을 반복문 처리하려면 인덱스를 기록하여 C 언어로 코드를 작성할 수도 있고, [string 문서](https://doc.rust-lang.org/std/primitive.str.html)를 보면 알 수 있듯이 [`Chars`]( https://doc.rust-lang.org/std/str/struct.Chars.html)의 이터레이터로 작성할 수도 있습니다.

:::info
`Chars` 이터레이터는 인덱스를 트래킹해서 범위를 확인하는 추상적 방법으로 안전하다 느낄 수 있습니다.

`chars.next()`를 실행하면 `Option<char>`가 반환된다.
단, `char`는 0에서 255까지의 ASCII 값이 아니라는 점에 유의해야 한다.
이는 0에서 0x10FFFF까지를 범위로 하는 utf8의 유니코드 포인트입니다.
:::

첫 번째 Lexer의 추상화를 정의해 봅시다.

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
여기서 `'a`의 lifetime은 이터레이터가 어딘가를 참조하고 있음을 나타내며, 이 경우 `&'a str`을 참조합다.
:::

소스 텍스트를 토큰으로 변환하려면 `chars.next()`를 계속 호출하여 반환되는 `char`와 일치시키면 된다. 마지막 토큰은 반드시 `Kind::Eof`가 된다.

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
        self.source.len() - self.chars.as_str().len()
    }
}
```
`fn offset` 내부에서 호출되는 `.len()`과 `.as_str().len()` 메서드는 O(n)처럼 느껴지므로 좀 더 자세히 살펴봅시다.

[`.as_str()`](https://doc.rust-lang.org/src/core/str/iter.rs.html#112)은 문자열 슬라이스에 대한 포인터를 반환합니다.


```rust reference
https://github.com/rust-lang/rust/blob/b998821e4c51c44a9ebee395c91323c374236bbb/library/core/src/str/iter.rs#L112-L115
```

[slice](https://doc.rust-lang.org/std/slice/index.html)는 포인터와 길이로 표현되는 메모리 블록 내의 뷰입니다.
`.len()` 메서드는 슬라이스 내부에 보관된 메타데이터를 반환한다.

```rust reference
https://github.com/rust-lang/rust/blob/b998821e4c51c44a9ebee395c91323c374236bbb/library/core/src/str/mod.rs#L157-L159
```

```rust reference
https://github.com/rust-lang/rust/blob/b998821e4c51c44a9ebee395c91323c374236bbb/library/core/src/str/mod.rs#L323-L325
```

```rust reference
https://github.com/rust-lang/rust/blob/b998821e4c51c44a9ebee395c91323c374236bbb/library/core/src/slice/mod.rs#L129-L138
```

위의 모든 코드가 단일 데이터 액세스로 컴파일되므로 `.as_str().len()`은 실제로 O(1)이다.

## peek

`++`나 `+=`와 같은 여러 문자 연산자를 토큰화하려면 헬퍼 함수 `peek`가 필요합니다.

```rust
fn peek(&self) -> Option<char> {
    self.chars.clone().next()
}
```

원본 `chars`의 이터레이터를 진행하고 싶지 않으므로, 이터레이터를 복제하여 그 인덱스를 진행합니다.

:::info
`clone`은 [소스 코드](https://doc.rust-lang.org/src/core/slice/iter.rs.html#148-152)를 자세히 살펴보면, 트래킹과 범위 인덱스를 복사하는 것만으로 비용이 낮아집니다.

```rust reference
https://github.com/rust-lang/rust/blob/b998821e4c51c44a9ebee395c91323c374236bbb/library/core/src/slice/iter.rs#L148-L152
```

:::

`peek`와 `chars.next()`의 차이점은 `peek`는 항상 같은 다음 `char`를 반환하는 반면, `chars.next()`는 진행되다가 다른 `char`를 반환한다는 점입니다.

이를 보여주기 위해 `abc`라는 문자열로 생각해 봅시다.

- 반복적으로 `peek()`를 호출하면 `Some(a)`, `Some(a)`, `Some(a)`, ... 와 같이 반환됩니다.
- 반복적으로 `chars.next()`를 호출하면 `Some('a')`, `Some('b')`, `Some('c')`, `None`과 같이 반환됩니다.

`peek`를 통해 토큰화하는 `++`와 `+=`는 단순한 중첩된 if 문입니다.

다음은 [jsparagus](https://github.com/mozilla-spidermonkey/jsparagus)의 실제 구현입니다.

```rust reference
https://github.com/mozilla-spidermonkey/jsparagus/blob/master/crates/parser/src/lexer.rs#L1769-L1791
```

위의 로직은 모든 연산자에 적용되므로, 자바스크립트 파싱에 대한 지식을 넓혀봅시다.

## JavaScript

Rust로 작성된 lexer는 지루하고, 긴 연쇄 if 문과 각 `char`를 체크하여 각각의 토큰을 반환하는 C 코드를 작성하는 것처럼 보입니다.

진짜 재미는 자바스크립트 파싱을 시작하는 곳부터 시작됩니다.

[ECMAScript 사양](https://tc39.es/ecma262/) 열어보고 JavaScript 다시 배워봅시다.

:::caution
저는 처음 사양서를 열어보고 전문용어로 가득 찬 외국어를 읽는 것 같은 느낌에 엉엉 울었던 기억이 아직도 생생합니다.
그래서 이해가 안 되는 부분이 있으면 제 [사양 읽는 법 가이드](/blog/ecma-spec)를 참고하세요.
:::

### Comments

주석은 시맨틱한 의미를 갖지 않고 런타임에는 설명이 생략되지만, linter나 bundler를 작성하는 경우 이를 고려해야 한다.

### Identifiers and Unicode

우리는 대부분 ASCII로 코드를 작성하지만, [Chapter 11 ECMAScript Language: Source Text](https://tc39.es/ecma262/#sec-ecmascript-language-source-code)에서는 소스 텍스트가 유니코드여야 한다고 나와 있습니다.
또한, [Chapter 12.6 Names and Keywords](https://tc39.es/ecma262/#sec-names-and-keywords)에서는 식별자가 Unicode Standard Annex #31의 Default Identifier Syntax에 따라 해석된다고 명시되어 있습니다.
자세한 내용은 다음과 같습니다.

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

즉, `var ಠ_ಠ`라고 쓸 수는 있지만 `var 🦀`라고 쓸 수는 없으며, `ಠ`는 유니코드의 "ID_Start" 속성을 가지고 있는 반면 `🦀`는 그렇지 않다는 것입니다.

:::info

저는 이 목적을 위해 [unicode-id-start](https://crates.io/crates/unicode-id-start)라는 crate를 공개했습니다.
`unicode_id_start::is_id_start(char)`와 `unicode_id_start::is_id_continue(char)`를 호출하여 유니코드 검사를 할 수 있습니다.

:::

### Keywords

`if`나 `while`, `for`와 같은 [Keywords](https://tc39.es/ecma262/#sec-keywords-and-reserved-words)는 토큰화하여 전체적으로 해석해야 합니다.
파서에서 문자열 비교를 필요로 하지 않도록 토큰의 종류 열거형에 추가해야 하고요.

```rust
pub enum Kind {
    Identifier,
    If,
    While,
    For
}
```

:::caution
`undefined`는 키워드가 아니므로 여기에 추가할 필요가 없습니다.
:::

키워드의 토큰화는 위에서 설명한 식별자와 일치하는 것만으로 가능합니다.

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

예를 들어, linter에서 식별자에 대한 테스트와 같이 컴파일러의 후반 단계에서 식별자, 숫자, 문자열을 비교해야 하는 경우가 종종 있습니다.

이 값들은 현재 일반 소스 텍스트이므로, 다루기 쉽도록 Rust 타입으로 변환해 봅시다.

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

식별자 `foo`나 문자열 `"bar"`가 토큰화되면 다음과 같이 반환됩니다.

```markup
Token { kind: Kind::Identifier, start: 0, end: 2, value: TokenValue::String("foo") }
Token { kind: Kind::String, start: 0, end: 4, value: TokenValue::String("bar") }
```

이를 Rust의 문자열로 변환하려면 `let s = self.source[token.start..token.end].to_string()`을 호출하여 `token.value = TokenValue::String(s)`로 저장합니다.

숫자 `1.23`을 토큰화하면 `Token { start: 0, end: 3 }`이 토큰으로 반환됩니다.
이를 Rust의 `f64`로 변환하려면 `self.source[token.start..token.end].parse::<f64>()`를 호출하여 문자열의 [`parse`](https://doc.rust-lang.org/std/ primitive.str.html#method.parse) 메서드를 사용할 수 있으며, `token.value`에 값을 저장합니다.
2진수, 8진수, 정수에 대해서는 [jsparagus](https://github.com/mozilla-spidermonkey/jsparagus/blob/master/crates/parser/src/numeric_value.rs)에서 분석하는 기법의 예를 확인할 수 있습니다.

## Rust Optimizations

### Smaller Tokens

토큰의 값을 `Kind` 열거형 안에 넣어 보다 간단하고 안전한 코드를 지향하고 싶을 것 입니다.

```rust
pub enum Kind {
    Number(f64),
    String(String),
}
```

하지만 Rust의 열거형의 바이트 크기는 모든 변형을 합한 것으로 알려져 있습니다.
이 열거형은 원래 1바이트인 열거형에 비해 많은 바이트가 들어가며,
파서에서 이 종류의 열거형을 많이 사용하는 경우, 멀티바이트 열거형보다 1바이트 열거형을 처리하는 것이 분명히 더 빠릅니다.

### String Interning

주로 이하의 이유로 컴파일러에서의 `String` 성능은 좋지 않습니다:

- `String`은 힙에 할당된 객체
- 문자열 비교는 O(n)의 연산

[String Interning](https://en.wikipedia.org/wiki/String_interning)은 각 문자열의 값의 복사본을 고유한 식별자를 가지고 하나만 캐시에 보유함으로써 이러한 문제를 해결합니다.
고유한 식별자 또는 문자열마다 한 번만 힙을 할당하게 되며, 문자열 비교는 O(1)이 되고요.

[crates.io](https://crates.io/search?q=string%20interning)에는 장단점이 다른 String Interning 라이브러리가 많이 있습니다.

시작하기에 충분한 것으로는 [`string-cache`](https://crates.io/crates/string_cache)가 있는데, 이는 `Atom` 타입과 컴파일 시 `atom!("string")`의 인터페이스를 가집니다.

`string-cache`에서 `TokenValue`는 이렇게 됩니다,

```rust
#[derive(Debug, Clone, PartialEq)]
pub enum TokenValue {
    None,
    Number(f64),
    // highlight-next-line
    String(Atom),
}
```

문자열 비교는 `matches!(value, TokenValue::String(atom!("string")))`로 합니다.
