---
id: lexer
title: 字句解析器 (レキサー)
---

## トークン

トークナイザーやスキャナーとしても知られる字句解析器は、ソースコード(文字列)をトークンに変換する役割を持っています。
トークンは後で構文解析器(パーサー)によって利用されるので、元のテキストからの空白やコメントについて気にしないで問題ありません。

まずはシンプルなものから始めて、1 つの `+` をトークンに変換しましょう。

```rust
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Token {
    /// トークンの型
    pub kind: Kind,

    /// ソースにおけるオフセットの開始位置
    pub start: usize,

    /// ソースにおけるオフセットの終了位置
    pub end: usize,
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Kind {
    Eof, // ファイルの終端
    Plus,
}
```

単独の`+`は以下のようになります。

```
[
    Token { kind: Kind::Plus, start: 0, end: 1 },
    Token { kind: Kind::Eof,  start: 1, end: 1 }
]
```

文字列をループ処理するには、インデックスを記録して C 言語のコードを書くようにもできるし、[string のドキュメント](https://doc.rust-lang.org/std/primitive.str.html)を見れば気づくように [`Chars`](https://doc.rust-lang.org/std/str/struct.Chars.html) のイテレーターで書くこともできます。

:::info
`Chars` のイテレーターは、インデックスをトラッキングして境界のチェックを行う抽象的な方法で、安全だと感じられます。

`chars.next()` を実行すれば `Option<char>` が返されます。
ただし `char` が 0 から 255 の ASCII の値ではないことに留意してください。
これは 0 から 0x10FFFF を範囲とする utf8 のユニコードポイントです。
:::

最初の字句解析器の抽象化を定義しましょう。

```rust
use std::str::Chars;

struct Lexer<'a> {
    /// ソースのテキスト
    source: &'a str,

    /// 残りの文字
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
ここでの `'a` のライフタイムはイテレーターがどこかを参照していることを示し、このケースであれば `&'a str` を参照します。
:::

ソーステキストをトークンへ変換するには、`chars.next()` を呼び続けて返される `char` にマッチさせるだけです。最後のトークンは必ず `Kind::Eof` になります。

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

    /// ソーステキストからの長さのオフセットをUTF-8バイトで取得
    fn offset(&self) -> usize {
        self.source.len() - self.chars.as_str().len()
    }
}
```

`fn offset` の内部で呼ばれる `.len()` と `.as_str().len()` のメソッドは O(n) のように感じられるので、より深く掘り下げてみましょう。

[`.as_str()`](https://doc.rust-lang.org/src/core/str/iter.rs.html#112) は文字列のスライスへのポインターを返します。

```rust reference
https://github.com/rust-lang/rust/blob/b998821e4c51c44a9ebee395c91323c374236bbb/library/core/src/str/iter.rs#L112-L115
```

[スライス](https://doc.rust-lang.org/std/slice/index.html) は、ポインターと長さで表されるメモリーのブロック内のビューです。
`.len()` メソッドはスライス内部に保持されるメタデータを返します。

```rust reference
https://github.com/rust-lang/rust/blob/b998821e4c51c44a9ebee395c91323c374236bbb/library/core/src/str/mod.rs#L157-L159
```

```rust reference
https://github.com/rust-lang/rust/blob/b998821e4c51c44a9ebee395c91323c374236bbb/library/core/src/str/mod.rs#L323-L325
```

```rust reference
https://github.com/rust-lang/rust/blob/b998821e4c51c44a9ebee395c91323c374236bbb/library/core/src/slice/mod.rs#L129-L138
```

上述のコード全てが単一のデータアクセスへとコンパイルされるので、`.as_str().len()` は実際のところ O(1) です。

## peek

`++` や `+=` のような複数の文字の演算子をトークン化するにはヘルパー関数 `peek` が必要です:

```rust
fn peek(&self) -> Option<char> {
    self.chars.clone().next()
}
```

オリジナルの `chars` のイテレーターを進めたくないので、イテレーターをクローンしてそのインデックスを進めます。

:::info
`clone` は[ソースコード](https://doc.rust-lang.org/src/core/slice/iter.rs.html#148-152)を掘り下げてみると、追跡と境界のインデックスをコピーするだけで、コストの低いものです。

```rust reference
https://github.com/rust-lang/rust/blob/b998821e4c51c44a9ebee395c91323c374236bbb/library/core/src/slice/iter.rs#L148-L152
```

:::

`peek` と `chars.next()`との違いは、前者が常に**同じ**次の `char` を返すのに対して、後者が前に進めて異なる `char` を返すことです。

それを示すために、文字列`abc`で考えてみましょう:

- 繰り返して `peek()` を呼ぶと `Some(a)`, `Some(a)`, `Some(a)`, ...のように返ります。
- 繰り返して `chars.next()` を呼ぶと `Some('a')`, `Some('b')`, `Some('c')`, `None` のように返ります。

`peek` を備えてトークン化する`++`と`+=`は単なる入れ子の if 文です。

こちらが [jsparagus](https://github.com/mozilla-spidermonkey/jsparagus) による実際の実装です:

```rust reference
https://github.com/mozilla-spidermonkey/jsparagus/blob/master/crates/parser/src/lexer.rs#L1769-L1791
```

上述のロジックは全ての演算子に当てはまるので、JavaScript の字句解析の知識を広げてみましょう。

## JavaScript

Rust で書かれた字句解析器は退屈で、長く連鎖した if 文と各 `char` をチェックしてそれぞれのトークンを返すような C のコードを書いているかのようです。

本当の楽しさは JavaScript の字句解析を開始するところから始まります。

[ECMAScript の言語仕様](https://tc39.es/ecma262/) を開いて JavaScript を学び直しましょう。

:::caution
私は初めて仕様を開いて、専門用語で埋め尽くされた外国語を読んでいるような気分になって、すみっこで悶え泣いたことを今だに覚えています。
なので、理解できないことがあれば私の [仕様の読み方ガイド](/blog/ecma-spec) をご覧ください。
:::

### コメント

コメントはセマンティックな意味を持たず、ランタイムでは記述がスキップされますが、リンターやバンドラーを書くのであればこれを考慮する必要があります。

### 識別子とユニコード

私たちは大抵 ASCII でコードを書きますが、[Chapter 11 ECMAScript Language: Source Text](https://tc39.es/ecma262/#sec-ecmascript-language-source-code) ではソーステキストがユニコードであるべきと書かれています。
また、[Chapter 12.6 Names and Keywords](https://tc39.es/ecma262/#sec-names-and-keywords) では識別子が Unicode Standard Annex #31 の Default Identifier Syntax に基づいて解釈されると書かれています。
詳細には:

```markup
IdentifierStartChar ::
    UnicodeIDStart

IdentifierPartChar ::
    UnicodeIDContinue

UnicodeIDStart ::
    “ID_Start”のユニコードプロパティを持つ任意のユニコードのコードポイント

UnicodeIDContinue ::
    “ID_Continue”のユニコードプロパティを持つ任意のユニコードのコードポイント
```

つまり、`var ಠ_ಠ` と書くことはできるが `var 🦀` と書くことは出来ず、`ಠ` がユニコードの"ID_Start"のプロパティを持っている一方で `🦀` はそうではないということです。

:::info

私はこの目的のために[unicode-id-start](https://crates.io/crates/unicode-id-start)という crate を公開しました。
`unicode_id_start::is_id_start(char)` と `unicode_id_start::is_id_continue(char)` をユニコードのチェックのために呼ぶことができます。

:::

### キーワード

`if` や `while`、`for` のような [キーワード](https://tc39.es/ecma262/#sec-keywords-and-reserved-words) はトークン化して全体として解釈する必要があります。
パーサーにおいて文字列の比較を必要としないように、トークンの種別の列挙型に追加する必要があります。

```rust
pub enum Kind {
    Identifier,
    If,
    While,
    For
}
```

:::caution
`undefined` はキーワードではないので、ここで追加する必要のないものです。
:::

キーワードのトークン化は上述の識別子にマッチさせるだけです。

```rust
fn match_keyword(&self, ident: &str) -> Kind {
    // キーワードは全て 1 <= length <= 10
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

### トークンの値

例えばリンターにおける識別子に対するテストのように、コンパイラーの後の方の段階で識別子や数値、文字列を比較しなければならないことがよくあります。

これらの値は今現在プレーンなソーステキストなので、扱いやすくするため Rust の型に変換しましょう。

```rust
pub enum Kind {
    Eof, // ファイルの終端
    Plus,
    // highlight-start
    Identifier,
    Number,
    String,
    // highlight-end
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Token {
    /// トークン種別
    pub kind: Kind,

    /// ソースにおける開始位置
    pub start: usize,

    /// ソースにおける終了位置
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

識別子 `foo` や文字列 `"bar"` がトークン化されたら、以下のように返されます。

```markup
Token { kind: Kind::Identifier, start: 0, end: 2, value: TokenValue::String("foo") }
Token { kind: Kind::String, start: 0, end: 4, value: TokenValue::String("bar") }
```

これらを Rust の文字列へ変換するには、`let s = self.source[token.start..token.end].to_string()` を呼んで `token.value = TokenValue::String(s)` として保存します。

数値 `1.23` をトークン化すると、`Token { start: 0, end: 3 }` がトークンとして返されます。
これを Rust の `f64` へ変換するには、`self.source[token.start..token.end].parse::<f64>()` を呼ぶことで文字列の [`parse`](https://doc.rust-lang.org/std/primitive.str.html#method.parse) メソッドを使うことが出来て、
`token.value` へ値を保存します。
2 進数、8 進数、整数については、[jsparagus](https://github.com/mozilla-spidermonkey/jsparagus/blob/master/crates/parser/src/numeric_value.rs) において解析するテクニックの例を確認できます。

## Rust の最適化

### より小さいトークン

トークンの値を`Kind`の列挙型の中に入れて、よりシンプルで安全なコードを目指したくなります:

```rust
pub enum Kind {
    Number(f64),
    String(String),
}
```

しかし、Rust の列挙型のバイトサイズはその全てのバリエーションの和であることが知られています。
この列挙型は元々の 1 バイトしかない列挙型と比較して大量のバイトをつめ込みます。
パーサーにおいてこの Kind の列挙型を多用する場合、マルチバイトの列挙型よりも 1 バイトの列挙型を扱う方が明らかに高速です。

### 文字列のインターン化

主に以下の理由で、コンパイラーにおいて `String` を利用するのはパフォーマンスが良くありません:

- `String` はヒープに割り当てられたオブジェクト
- 文字列の比較は O(n)の演算

[文字列のインターン化](https://en.wikipedia.org/wiki/String_interning) は、各文字列の値のコピーを一意な識別子で持たせて 1 つだけキャッシュに持つことで、このような問題を解決します。
一意な識別子か文字列ごとに 1 度だけのヒープ割り当てとなり、文字列比較は O(1)となります。

[crates.io](https://crates.io/search?q=string%20interning) には、長所や短所も異なる文字列のインターン化のライブラリーが多くあります。

スタートの時点で十分なものとして [`string-cache`](https://crates.io/crates/string_cache) があり、これは `Atom` 型とコンパイル時の `atom!("string")` のインターフェイスを持ちます。

`string-cache` で `TokenValue` はこのようになり、

```rust
#[derive(Debug, Clone, PartialEq)]
pub enum TokenValue {
    None,
    Number(f64),
    // highlight-next-line
    String(Atom),
}
```

文字列の比較は `matches!(value, TokenValue::String(atom!("string")))` となります。
