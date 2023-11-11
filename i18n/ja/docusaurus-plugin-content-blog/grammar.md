---
title: 文法
---

JavaScript の文法は解析が非常に困難なものの一つであり、
このチュートリアルでは私が学習中に経験した苦労と涙を詳細に説明します。

## LL(1)文法

[Wikipedia](https://en.wikipedia.org/wiki/LL_grammar) によると、

> an LL grammar is a context-free grammar that can be parsed by an LL parser, which parses the input from Left to right

最初の「L」はソースを左から右にスキャンすることを意味し、
2番目の「L」は左端導出木の構築を意味します。

文脈自由であり、LL(1) の「1」は次のトークンを覗き見るだけで木を構築できることを意味します。

LL 文法は、私たちが怠惰な人間であり、パーサを手動で書く必要がないように、プログラムを自動的に生成するプログラムを書きたいという理由で、学術界で特に興味を持たれています。

残念なことに、ほとんどの産業用プログラミング言語には素晴らしい LL(1) 文法はありません。
JavaScript もその例外ではありません。

:::info
Mozillaは数年前に [jsparagus](https://github.com/mozilla-spidermonkey/jsparagus) プロジェクトを開始し、
[Python で LALR パーサジェネレータ](https://github.com/mozilla-spidermonkey/jsparagus/tree/master/jsparagus) を作成しました。
彼らは過去2年間ほとんど更新しておらず、[js-quirks.md](https://github.com/mozilla-spidermonkey/jsparagus/blob/master/js-quirks.md) の最後に強いメッセージを送っています。

> What have we learned today?
>
> - Do not write a JS parser.
> - JavaScript has some syntactic horrors in it. But hey, you don't make the world's most widely used programming language by avoiding all mistakes.

:::

---

JavaScript を解析する唯一の実用的な方法は、その文法の性質上、手動で再帰下降パーサを書くことです。
そのため、足を撃つ前に文法の特異性をすべて学びましょう。

以下のリストは簡単なものから理解が難しくなりますので、
コーヒーを飲んでゆっくりと時間をかけてください。

## 識別子

`#sec-identifiers` で定義されている識別子には3つのタイプがあります。

```markup
IdentifierReference[Yield, Await] :
BindingIdentifier[Yield, Await] :
LabelIdentifier[Yield, Await] :
```

`estree` および一部の AST では、上記の識別子を区別せず、仕様書ではそれらを平文で説明していません。

`BindingIdentifier` は宣言であり、`IdentifierReference` はバインディング識別子への参照です。
例えば、`var foo = bar` の場合、`foo` は文法上の `BindingIdentifier` であり、`bar` は `IdentifierReference` です。

```markup
VariableDeclaration[In, Yield, Await] :
    BindingIdentifier[?Yield, ?Await] Initializer[?In, ?Yield, ?Await] opt

Initializer[In, Yield, Await] :
    = AssignmentExpression[?In, ?Yield, ?Await]
```

`AssignmentExpression` を `PrimaryExpression` にたどると、

```markup
PrimaryExpression[Yield, Await] :
    IdentifierReference[?Yield, ?Await]
```

ASTでこれらの識別子を異なる方法で宣言すると、特に意味解析のために、下流のツールを大幅に簡素化することができます。

```rust
pub struct BindingIdentifier {
    pub node: Node,
    pub name: Atom,
}

pub struct IdentifierReference {
    pub node: Node,
    pub name: Atom,
}
```

---

## クラスと Strict モード

ECMAScript のクラスは、Strict モードの後に生まれたため、クラス内のすべての要素はシンプルさのために Strict モードである必要があります。
`#sec-class-definitions` では、`Node: A class definition is always strict mode code.` と述べられています。

関数スコープと関連付けることで Strict モードを宣言することは簡単ですが、`class` 宣言にはスコープがないため、クラスの解析のために追加の状態を保持する必要があります。

```rust reference
https://github.com/swc-project/swc/blob/f9c4eff94a133fa497778328fa0734aa22d5697c/crates/swc_ecma_parser/src/parser/class_and_fn.rs#L85
```

---

## レガシーオクタルと Use Strict

`#sec-string-literals-early-errors` では、文字列内のエスケープされたレガシーオクタル `"\01"` は許可されていません。

```markup
EscapeSequence ::
    LegacyOctalEscapeSequence
    NonOctalDecimalEscapeSequence

このプロダクションにマッチするソーステキストが Strict モードコードである場合、構文エラーです。
```

これを検出するのに最適な場所は、レキサーの内部です。レキサーはパーサーに Strict モードの状態を尋ね、それに応じてエラーをスローすることができます。

しかし、これはディレクティブと混在した場合には不可能になります。

```javascript reference
https://github.com/tc39/test262/blob/747bed2e8aaafe8fdf2c65e8a10dd7ae64f66c47/test/language/literals/string/legacy-octal-escape-sequence-prologue-strict.js#L16-L19
```

`use strict` はエスケープされたレガシーオクタルの後に宣言されていますが、構文エラーがスローされる必要があります。
幸いなことに、実際のコードではディレクティブとレガシーオクタルを組み合わせることはありません...上記の test262 のケースをパスしたい場合を除いては。

---

## 非単純パラメータと Strict モード

非Strictモードでは、同じ関数パラメータを許可します `function foo(a, a) { }`、そして `use strict` を追加することでこれを禁止することができます：`function foo(a, a) { "use strict" }`。
その後のes6では、関数パラメータに他の文法が追加されました。例えば `function foo({ a }, b = c) {}`。

では、次のようなコードを書いた場合、"01" は Strict モードのエラーとなるのでしょうか？

```javaScript
function foo(value=(function() { return "\01" }())) {
    "use strict";
    return value;
}
```

具体的には、パーサーの観点からパラメータ内に Strict モードの構文エラーがある場合、どうすべきでしょうか？
そのため、`#sec-function-definitions-static-semantics-early-errors` では、次のように述べてこれを禁止しています。

```markup
FunctionDeclaration :
FunctionExpression :

FunctionBodyがFunctionBodyContainsUseStrictでtrueであり、FormalParametersがIsSimpleParameterListでfalseである場合、構文エラーです。
```

Chrome は、謎めいたメッセージ「Uncaught SyntaxError: Illegal 'use strict' directive in function with non-simple parameter list」というエラーをスローします。

詳細な説明は、ESLint の作者による [このブログ記事](https://humanwhocodes.com/blog/2016/10/the-ecmascript-2016-change-you-probably-dont-know/) に記載されています。

:::info

興味深い事実ですが、TypeScript で `es5` をターゲットにしている場合、上記のルールは適用されません。次のようにトランスパイルされます。

```javaScript
function foo(a, b) {
    "use strict";
    if (b === void 0) { b = "\01"; }
}
```

:::

---

## ParenthesizedExpression

ParenthesizedExpression (パレン式)には意味がないはずですか？
例えば、`((x))`のASTは、`ParenthesizedExpression` -> `ParenthesizedExpression` -> `IdentifierReference` ではなく、単一の `IdentifierReference` であることができます。
そして、これは JavaScript の文法の場合です。

しかし...誰が実行時の意味を持つことができると思ったでしょうか。
[この estree の問題](https://github.com/estree/estree/issues/194)で見つかったように、

```javascript
> fn = function () {};
> fn.name
< "fn"

> (fn) = function () {};
> fn.name
< ''
```

結局のところ、acorn と babel は互換性のために `preserveParens` オプションを追加しました。

---

## if文内の関数宣言

`#sec-ecmascript-language-statements-and-declarations` の文法に厳密に従うと、

```markup
Statement[Yield, Await, Return] :
    ...たくさんの文

Declaration[Yield, Await] :
    ...宣言
```

私たちのASTのために定義した `Statement` ノードには明らかに `Declaration` は含まれていませんが、

しかし、Annex B `#sec-functiondeclarations-in-ifstatement-statement-clauses` では、非厳密モードの `if` 文の文の位置に宣言を許可しています。

```javascript
if (x) function foo() {}
else function bar() {}
```

---

## ラベル文は正当です

おそらく私たちは一行もラベル付き文を書いたことがないでしょうが、それは現代の JavaScript では正当であり、厳密モードでは禁止されていません。

次の構文は正しいですが、オブジェクトリテラルではなく、ラベル付き文を返します。

```javascript
<Foo
  bar={() => {
    baz: "quaz";
  }}
/>
//   ^^^^^^^^^^^ `LabelledStatement`
```

---

## `let` はキーワードではありません

`let` はキーワードではないため、文法が明示的にそのような位置に `let` が許可されていないと述べている限り、どこにでも現れることが許されています。
パーサーは `let` トークンの次のトークンを覗き見て、それをどのように解析するかを決定する必要があります。例えば：

```javascript
let a;
let = foo;
let instanceof x;
let + 1;
while (true) let;
a = let[0];
```

---

## For-in / For-of と [In] コンテキスト

`#prod-ForInOfStatement` の `for-in` および `for-of` の文法を見ると、これらを解析する方法がすぐにわかりにくくなります。

私たちが理解するための2つの主な障害があります：`[lookahead ≠ let]` の部分と `[+In]` の部分です。

`for (let` まで解析した場合、次のトークンを確認する必要があります：

- `in` ではないこと（`for (let in` を許可しないため）
- `{`、`[`、または識別子であること（`for (let {} = foo)`、`for (let [] = foo)`、`for (let bar = foo)` を許可するため）

`of` または `in` キーワードに到達したら、右辺の式は正しい[+In]コンテキストで渡す必要があります。これにより、`#prod-RelationalExpression` の2つの `in` 式が許可されなくなります。

```
RelationalExpression[In, Yield, Await] :
    [+In] RelationalExpression[+In, ?Yield, ?Await] in ShiftExpression[?Yield, ?Await]
    [+In] PrivateIdentifier in ShiftExpression[?Yield, ?Await]

Note 2: [In ]文法パラメータは、関係式内のin演算子とfor文内のin演算子を混同しないために必要です。
```

これは仕様全体での [In] コンテキストの唯一の適用です。

また、文法 `[lookahead ∉ { let, async of }]` は `for (async of ...)` を禁止しており、明示的に防止する必要があります。

---

## ブロックレベルの関数宣言

Annex B.3.2 `#sec-block-level-function-declarations-web-legacy-compatibility-semantics` では、`FunctionDeclaration` が `Block` 文でどのように動作するかを説明するために1ページが割かれています。
要点は次のとおりです。

```javascript reference
https://github.com/acornjs/acorn/blob/11735729c4ebe590e406f952059813f250a4cbd1/acorn/src/scope.js#L30-L35
```

`FunctionDeclaration` の名前は、関数宣言内にある場合には `var` 宣言と同じように扱われる必要があります。
次のコードスニペットは、`bar` がブロックスコープ内にあるため、再宣言エラーが発生します。

```javascript
function foo() {
  if (true) {
    var bar;
    function bar() {} // 再宣言エラー
  }
}
```

一方、次のコードはエラーになりません。関数 `bar` は関数スコープ内にあるため、var 宣言として扱われます。

```javascript
function foo() {
  var bar;
  function bar() {}
}
```

---

## 文法コンテキスト

構文的な文法には、特定の構造を許可または禁止するための 5 つのコンテキストパラメータがあります。
具体的には、`[In]`、`[Return]`、`[Yield]`、`[Await]`、`[Default]` です。

解析中にコンテキストを保持することが最善です。例えば、Romeでは次のようになります。

```rust reference
https://github.com/rome/tools/blob/5a059c0413baf1d54436ac0c149a829f0dfd1f4d/crates/rome_js_parser/src/state.rs#L404-L425
```

そして、文法に従ってこれらのフラグを切り替えて確認することが重要です。

## AssignmentPattern と BindingPattern

`estree` では、`AssignmentExpression` の左辺は `Pattern` です。

```markup
extend interface AssignmentExpression {
    left: Pattern;
}
```

そして、`VariableDeclarator` の左辺も `Pattern` です。

```markup
interface VariableDeclarator <: Node {
    type: "VariableDeclarator";
    id: Pattern;
    init: Expression | null;
}
```

`Pattern` は `Identifier`、`ObjectPattern`、`ArrayPattern` のいずれかです。

```markup
interface Identifier <: Expression, Pattern {
    type: "Identifier";
    name: string;
}

interface ObjectPattern <: Pattern {
    type: "ObjectPattern";
    properties: [ AssignmentProperty ];
}

interface ArrayPattern <: Pattern {
    type: "ArrayPattern";
    elements: [ Pattern | null ];
}
```

しかし、仕様の観点からは、次のような JavaScript があります。

```javascript
// AssignmentExpression:
{ foo } = bar;
  ^^^ IdentifierReference
[ foo ] = bar;
  ^^^ IdentifierReference

// VariableDeclarator
var { foo } = bar;
      ^^^ BindingIdentifier
var [ foo ] = bar;
      ^^^ BindingIdentifier
```

これは混乱を招くようになります。なぜなら、`Identifier` が `BindingIdentifier` なのか `IdentifierReference` なのかを直接区別することができなくなるからです。

```rust
enum Pattern {
    Identifier, // これは`BindingIdentifier`なのか`IdentifierReference`なのか？
    ArrayPattern,
    ObjectPattern,
}
```

これにより、パーサーパイプラインのさらなる不要なコードが発生します。たとえば、意味解析のスコープを設定する際に、この `Identifier` をスコープにバインドするかどうかを判断するために、この `Identifier` の親を調べる必要があります。

より良い解決策は、仕様を完全に理解し、何をするかを決定することです。

`AssignmentExpression` と `VariableDeclaration` の文法は次のように定義されています。

```marup
13.15 Assignment Operators

AssignmentExpression[In, Yield, Await] :
    LeftHandSideExpression[?Yield, ?Await] = AssignmentExpression[?In, ?Yield, ?Await]

13.15.5 Destructuring Assignment

In certain circumstances when processing an instance of the production
AssignmentExpression : LeftHandSideExpression = AssignmentExpression
the interpretation of LeftHandSideExpression is refined using the following grammar:

AssignmentPattern[Yield, Await] :
    ObjectAssignmentPattern[?Yield, ?Await]
    ArrayAssignmentPattern[?Yield, ?Await]
```

```markup
14.3.2 Variable Statement

VariableDeclaration[In, Yield, Await] :
    BindingIdentifier[?Yield, ?Await] Initializer[?In, ?Yield, ?Await]opt
    BindingPattern[?Yield, ?Await] Initializer[?In, ?Yield, ?Await]
```

仕様では、これらの文法を `AssignmentPattern` と `BindingPattern` として別々に定義して区別しています。

そのため、このような状況では、`estree` から逸脱して、パーサーのために追加のASTノードを定義することを恐れないでください。

```rust
enum BindingPattern {
    BindingIdentifier,
    ObjectBindingPattern,
    ArrayBindingPattern,
}

enum AssignmentPattern {
    IdentifierReference,
    ObjectAssignmentPattern,
    ArrayAssignmentPattern,
}
```

私は1週間もの間、非常に混乱していましたが、ついに悟りに達しました。単一の `Pattern` ノードではなく、`AssignmentPattern` ノードと `BindingPattern` ノードを定義する必要があります。

- `estree` は正しいはずです。何年も使われているので間違っているはずがありませんよね？
- パターン内の `Identifier` をきれいに区別する方法はありますか？文法はどこにあるのか見つけられません。
- 1日中仕様を調べても、`AssignmentPattern` の文法はメインセクションの5番目のサブセクションにあり、サブタイトルが「Supplemental Syntax」であることがわかりました。これは本当に場違いです。すべての文法はメインセクションで定義されているのに、この文法だけが「Runtime Semantics」セクションの後に定義されています。

---

:::caution
以下のケースは非常に理解が難しいです。注意が必要です。
:::

## 曖昧な文法

まず、パーサーのように考えて問題を解決しましょう - `/` トークンが除算演算子なのか正規表現式の開始なのかを判断します。

```javascript
a / b;
a / / regex /;
a /= / regex /;
/ regex / / b;
/=/ / /=/;
```

これはほとんど不可能ですね。これらを分解して文法に従ってみましょう。

まず理解する必要があるのは、構文的文法が字句的文法を駆動するということです。`#sec-ecmascript-language-lexical-grammar` で述べられています。

> There are several situations where the identification of lexical input elements is sensitive to the syntactic grammar context that is consuming the input elements.

これは、パーサーが次に返すトークンを字句解析器に指示する責任があることを意味します。
上記の例では、字句解析器が `/` トークンまたは `RegExp` トークンのいずれかを返す必要があります。
正しい `/` または `RegExp` トークンを取得するために、仕様は次のように述べています。

> The InputElementRegExp goal symbol is used in all syntactic grammar contexts where a RegularExpressionLiteral is permitted ... In all other contexts, InputElementDiv is used as the lexical goal symbol.

そして、`InputElementDiv` と `InputElementRegExp` の構文は次のようになります。

```markup
InputElementDiv ::
    WhiteSpace
    LineTerminator
    Comment
    CommonToken
    DivPunctuator <---------- `/`および`/=`トークン
    RightBracePunctuator

InputElementRegExp ::
    WhiteSpace
    LineTerminator
    Comment
    CommonToken
    RightBracePunctuator
    RegularExpressionLiteral <-------- `RegExp`トークン
```

これは、文法が `RegularExpressionLiteral` に到達するたびに、`/` を `RegExp` トークンとしてトークン化する必要があることを意味します（一致する `/` がない場合はエラーをスローします）。
それ以外の場合は、`/` をスラッシュトークンとしてトークン化します。

例を見てみましょう：

```
a / / regex /
^ ------------ PrimaryExpression:: IdentifierReference
  ^ ---------- MultiplicativeExpression: MultiplicativeExpression MultiplicativeOperator ExponentiationExpression
    ^^^^^^^^ - PrimaryExpression: RegularExpressionLiteral
```

この文は `Statement` の他の開始と一致しないため、`ExpressionStatement` のルートに進みます。

`ExpressionStatement` --> `Expression` --> `AssignmentExpression` --> ... -->
`MultiplicativeExpression` --> ... -->
`MemberExpression` --> `PrimaryExpression` --> `IdentifierReference`。

`IdentifierReference` で止まり、`RegularExpressionLiteral` ではなく、文「それ以外のすべてのコンテキストでは、InputElementDivが字句ゴール記号として使用されます」が適用されます。
最初のスラッシュは `DivPunctuator` トークンです。

これが `DivPunctuator` トークンであるため、文法 `MultiplicativeExpression: MultiplicativeExpression MultiplicativeOperator ExponentiationExpression` が一致し、右辺は `ExponentiationExpression` であることが期待されます。

今度は `a / /` の2番目のスラッシュにいます。
`ExponentiationExpression` に従っていくと、`RegularExpressionLiteral` に到達します。なぜなら、`RegularExpressionLiteral` が `/` と一致する唯一の文法だからです。

```markup
RegularExpressionLiteral ::
    / RegularExpressionBody / RegularExpressionFlags
```

この2番目の `/` は `RegExp` としてトークン化されます。なぜなら、仕様が「RegularExpressionLiteral が許可されるすべての構文的文法コンテキストで InputElementRegExp ゴール記号が使用される」と述べているからです。

:::info
練習として、`/=/ / /=/` の文法に従ってみてください。
:::

---

## Cover Grammar

まず、このトピックに関する [V8のブログ記事](https://v8.dev/blog/understanding-ecmascript-part-4) を読んでください。

要約すると、仕様は次の3つの Cover Grammar を述べています：

#### CoverParenthesizedExpressionAndArrowParameterList

```markup
PrimaryExpression[Yield, Await] :
    CoverParenthesizedExpressionAndArrowParameterList[?Yield, ?Await]

PrimaryExpression[Yield, Await] : CoverParenthesizedExpressionAndArrowParameterList[?Yield, ?Await] のインスタンスを処理する際、CoverParenthesizedExpressionAndArrowParameterList の解釈は以下の文法を使用して洗練されます:

ParenthesizedExpression[Yield, Await] :
    ( Expression[+In, ?Yield, ?Await] )
```

```markup
ArrowFunction[In, Yield, Await] :
    ArrowParameters[?Yield, ?Await] [ここには LineTerminator がない] => ConciseBody[?In]

ArrowParameters[Yield, Await] :
    BindingIdentifier[?Yield, ?Await]
    CoverParenthesizedExpressionAndArrowParameterList[?Yield, ?Await]
```

これらの定義は以下を定義します:

```javascript
let foo = (a, b, c); // SequenceExpression
let bar = (a, b, c) => {}; // ArrowExpression
          ^^^^^^^^^ CoverParenthesizedExpressionAndArrowParameterList
```

この問題を解決するための単純で手間のかかるアプローチは、まず `Vec<Expression>` として解析し、
それを `ArrowParameters` ノードに変換する変換関数を書くことです。つまり、各個別の `Expression` を `BindingPattern` に変換する必要があります。

なお、もしパーサー内でスコープツリーを構築している場合、
つまり、パーサー内でアロー式のスコープを作成しているが、
シーケンス式のスコープは作成していない場合、
これをどのように行うかは明らかではありません。[esbuild](https://github.com/evanw/esbuild) は、一時的なスコープを作成し、
それが `ArrowExpression` でない場合には削除することで、この問題を解決しています。

これは、その [アーキテクチャドキュメント](https://github.com/evanw/esbuild/blob/master/docs/architecture.md#symbols-and-scopes) に記載されています:

> This is mostly pretty straightforward except for a few places where the parser has pushed a scope and is in the middle of parsing a declaration only to discover that it's not a declaration after all. This happens in TypeScript when a function is forward-declared without a body, and in JavaScript when it's ambiguous whether a parenthesized expression is an arrow function or not until we reach the => token afterwards. This would be solved by doing three passes instead of two so we finish parsing before starting to set up scopes and declare symbols, but we're trying to do this in just two passes. So instead we call popAndDiscardScope() or popAndFlattenScope() instead of popScope() to modify the scope tree later if our assumptions turn out to be incorrect.

---

#### CoverCallExpressionAndAsyncArrowHead

```markup
CallExpression :
    CoverCallExpressionAndAsyncArrowHead

CallExpression : CoverCallExpressionAndAsyncArrowHead のインスタンスを処理する際、CoverCallExpressionAndAsyncArrowHead の解釈は以下の文法を使用して洗練されます:

CallMemberExpression[Yield, Await] :
    MemberExpression[?Yield, ?Await] Arguments[?Yield, ?Await]
```

```markup
AsyncArrowFunction[In, Yield, Await] :
    CoverCallExpressionAndAsyncArrowHead[?Yield, ?Await] [ここには改行文字がない] => AsyncConciseBody[?In]

CoverCallExpressionAndAsyncArrowHead[Yield, Await] :
    MemberExpression[?Yield, ?Await] Arguments[?Yield, ?Await]

AsyncArrowFunction : CoverCallExpressionAndAsyncArrowHead => AsyncConciseBody のインスタンスを処理する際、CoverCallExpressionAndAsyncArrowHead の解釈は以下の文法を使用して洗練されます:

AsyncArrowHead :
    async [ここには改行文字がない] ArrowFormalParameters[~Yield, +Await]
```

これらの定義は次のように定義されます:

```javascript
async (a, b, c); // CallExpression
async (a, b, c) => {} // AsyncArrowFunction
^^^^^^^^^^^^^^^ CoverCallExpressionAndAsyncArrowHead
```

これは奇妙に見えるかもしれませんが、`async` はキーワードではありません。最初の `async` は関数名です。

---

#### CoverInitializedName

```markup
13.2.5 Object Initializer

ObjectLiteral[Yield, Await] :
    ...

PropertyDefinition[Yield, Await] :
    CoverInitializedName[?Yield, ?Await]

Note 3: In certain contexts, ObjectLiteral is used as a cover grammar for a more restricted secondary grammar.
The CoverInitializedName production is necessary to fully cover these secondary grammars. However, use of this production results in an early Syntax Error in normal contexts where an actual ObjectLiteral is expected.

13.2.5.1 Static Semantics: Early Errors

In addition to describing an actual object initializer the ObjectLiteral productions are also used as a cover grammar for ObjectAssignmentPattern and may be recognized as part of a CoverParenthesizedExpressionAndArrowParameterList. When ObjectLiteral appears in a context where ObjectAssignmentPattern is required the following Early Error rules are not applied. In addition, they are not applied when initially parsing a CoverParenthesizedExpressionAndArrowParameterList or CoverCallExpressionAndAsyncArrowHead.

PropertyDefinition : CoverInitializedName
    I* t is a Syntax Error if any source text is matched by this production.
```

```makrup
13.15.1 Static Semantics: Early Errors

AssignmentExpression : LeftHandSideExpression = AssignmentExpression
If LeftHandSideExpression is an ObjectLiteral or an ArrayLiteral, the following Early Error rules are applied:
    * LeftHandSideExpression must cover an AssignmentPattern.
```

これらの定義は次のように定義されます:

```javascript
({ prop = value } = {}); // ObjectAssignmentPattern
({ prop = value }); // SyntaxErrorを伴うObjectLiteral
```

パーサーは `CoverInitializedName` を持つ `ObjectLiteral` を解析し、`ObjectAssignmentPattern` のための `=` に到達しない場合は構文エラーをスローする必要があります。

練習として、次の `=` のうちどれが構文エラーをスローするでしょうか？

```javascript
let { x = 1 } = { x = 1 } = { x = 1 }
```
