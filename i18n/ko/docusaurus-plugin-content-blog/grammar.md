---
title: JavaScript 문법
---

자바스크립트는 파싱이 가장 어려운 문법 중 하나입니다, 이 튜토리얼에서는 제가 이 문법을 배우면서 흘린 땀과 눈물을 설명해드리겠습니다.

<!--truncate-->

## LL(1) 문법

[위키백과](https://en.wikipedia.org/wiki/LL_grammar)에 따르면,

> LL grammar은 문맥에 구애받지 않는 문법으로, 입력을 왼쪽에서 오른쪽으로 파싱하는 LL 파서로 파싱할 수 있습니다.

첫 번째 **L** 의 의미는 왼쪽에서 오른쪽으로 소스를 스캔한다는 것입니다,
두 번째 **L** 의 의미는 가장 왼쪽에서부터 파생 트리를 구성한다는 것을 입니다.

컨텍스트에서 자유로운 LL(1)은 (1)의 다음 토큰을 봄으로 트리를 구성할 수 있다는 뜻입니다.

LL Grammars이 학계에서 특히 관심을 끄는 이유는 우리는 게으른 인간이기에 수동으로 파서를 작성할 필요가 없도록 파서를 자동생성해주는 프로그램을 쓰고 싶지 때문입니다.

아쉽지만 대부분의 산업용 프로그래밍 언어는 LL(1) grammar가 없으며, JavaScript도 마찬가지입니다.

:::info
Mozilla는 수년 전[jsparagus](https://github.com/mozilla-spidermonkey/jsparagus) 프로젝트를 시작했습니다.
그들은 과거 2년간 그다지 업데이트가 없었고, [js-quirks.md](https://github.com/mozilla-spidermonkey/jsparagus/blob/master/js-quirks.md)가 마지막 강한 메세지를 남깁니다.

> 오늘 뭘 배웠지?
>
> - JS 파서를 작성하면 안 됨.
> - JavaScript에는 몇 가지 구문적으로 어두운 존재가 있음. 하지만 모든 실수를 피한다 해서 세계에서 가장 널리 사용되는 프로그래밍 언어를 만들 수 없음. 적절한 사용자를 위해 적절한 상황을 위해, 적절한 도구를 만들 뿐이다.

:::

---

JavaScript 파싱에서 유일하게 실용적인 방법은 문법 성질 상, 재귀적 강하하는 파서를 작성하는 것입니다.
그러니 발등 찍히기 전에 문법의 모든 기묘한 점을 배워봅시다.

아래 목록은 간단하게 시작하지만 이해는 어려울 수 있습니다,
차 마시며 느긋하게 읽어보세요.

## Identifiers(식별자)

`#sec-identifiers` 정의된 식별자에는 세가지 타입이 있습니다.

```markup
IdentifierReference[Yield, Await] :
BindingIdentifier[Yield, Await] :
LabelIdentifier[Yield, Await] :
```

`estree` 와 일부 AST는 위의 식별자를 구문으로 쓰지 않습니다.
또한 사양서는 그냥 글로 설명되어 있지 않습니다.

`BindingIdentifier` 선언, `IdentifierReference` 바인딩 식별자에 대한 참조입니다.
예를 들어 `var foo = bar`, `foo` 는 `BindingIdentifier`이며 `bar`는 `IdentifierReference` 입니다:

```markup
VariableDeclaration[In, Yield, Await] :
    BindingIdentifier[?Yield, ?Await] Initializer[?In, ?Yield, ?Await] opt

Initializer[In, Yield, Await] :
    = AssignmentExpression[?In, ?Yield, ?Await]
```

`AssignmentExpression`를 `PrimaryExpression` 대로 따르면 다음과 같이 됩니다.

```markup
PrimaryExpression[Yield, Await] :
    IdentifierReference[?Yield, ?Await]
```

AST 안에 이들 식별자를 다른 형태를 선언함은 특히 의미 해석에 따라 하방 도구에 큰 영향을 끼칩니다.

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

## Class and Strict Mode(클래스와 엄격 모드)

ECMAScript 클래스는 엄격모드 이후에 만들어 졌기에 클래스 내부에 모든 것이 엄격적이어야 했습니다. 이는 `#sec-class-definitions`에 `Node: A class definition is always strict mode code.`로 설명됩니다.

함수 스코프와 연관된 엄격 모드를 선언하는 것이 가능하지만 `class` 선언에는 범위가 없습니다,
클래스를 파싱하기 위해서는 추가로 상태를 갖을 필요가 있습니다.

```rust reference
https://github.com/swc-project/swc/blob/f9c4eff94a133fa497778328fa0734aa22d5697c/crates/swc_ecma_parser/src/parser/class_and_fn.rs#L85
```

---

## Legacy Octal and Use Strict(오래된 8진수과 use strict)

`#sec-string-literals-early-errors`는 문자열 `"\01"` 내에서 이스케이프된 오래된 8진수을 허용하지 않습니다:

```markup
EscapeSequence ::
    LegacyOctalEscapeSequence
    NonOctalDecimalEscapeSequence

It is a Syntax Error if the source text matched by this production is strict mode code.
```

이를 검출하기 위해 가장 좋은 곳은 lexer 안으로, 파서에 엄격 모드 상태를 묻고, 이에 따라 에러를 던질 수 있습니다.

그러나 directives가 섞이면 이는 불가능하다:

```javascript reference
https://github.com/tc39/test262/blob/747bed2e8aaafe8fdf2c65e8a10dd7ae64f66c47/test/language/literals/string/legacy-octal-escape-sequence-prologue-strict.js#L16-L19
```

`use strict` 는 에스케이프된 오래된 8진수 뒤에 선언되어 있지만, 구문 에러를 던질 필요가 있습니다.
다행스럽게도, 실제 코드에서 오래된 8진수의 directives를 사용할 수 없습니다.

---

## Non-simple Parameter and Strict Mode(간단하지 않은 파라메터와 엄격모드)

비엄격 모드에서는 동일 함수 파라메터를 사용할 수 있습니다.`function foo(a, a) { }`,
그리고 사용 엄격으로 막을 수 있습니다 `use strict`: `function foo(a, a) { "use strict" }`.
es6 이후에는, 함수 매개 변수에 다른 문법이 추가 되었습니다. 예시: `function foo({ a }, b = c) {}`.

그럼 "01"가 엄격 모드 에러인 경우 다음과 같이 작성 가능할까요?

```javaScript
function foo(value=(function() { return "\01" }())) {
    "use strict";
    return value;
}
```

더 구체적으로, 파서가 봤을 때 파라메터 내부에 엄격모드 구문 에러가 있을 경우 어떻게 될까요? 그래서, `#sec-function-definitions-static-semantics-early-errors`, 에는 다음과 같은 것이 금지됩니다.

```markup
FunctionDeclaration :
FunctionExpression :

It is a Syntax Error if FunctionBodyContainsUseStrict of FunctionBody is true and IsSimpleParameterList of FormalParameters is false.
```

크롬은 이 에러를 "Uncaught SyntaxError: Illegal 'use strict' directive in function with non-simple parameter list"라 의문의 메세지를 던집니다.

상세한 설명은 ESLint의 저자의 [글](https://humanwhocodes.com/blog/2016/10/the-ecmascript-2016-change-you-probably-dont-know/)에 게시되어 있습니다.

:::info

재밌는 사실은 TypeScript에서 `es5` 타겟하는 경우 상기한 규칙에서 벗어납니다.

```javaScript
function foo(a, b) {
    "use strict";
    if (b === void 0) { b = "\01"; }
}
```

:::

---

## Parenthesized Expression(괄호로 묶은 표현)

괄호 안에 표현식에는 어떤 의미론적 의미가 없을까요?
가령 `((x))` 에 AST는 `ParenthesizedExpression` -> `ParenthesizedExpression` -> `IdentifierReference`가 아닌 단일 `IdentifierReference`가 될 수 있습니다.
자바스크립트 문법에서도 마찬가지입니다.

하지만... 누가 런타임에 의미를 가질 수 있다 생각할까요?

[이 estree issue](https://github.com/estree/estree/issues/194)에 따르면 다음과 같은 내용이 있습니다.

```javascript
> fn = function () {};
> fn.name
< "fn"

> (fn) = function () {};
> fn.name
< ''
```

이에 최종적으로 acorn과 babel은 호환성을 위해서 `preserveParens` 옵션을 추가했습니다.

---

## Function Declaration in If Statement(if문에서 함수 선언)

`#sec-ecmascript-language-statements-and-declarations` 문법을 정확히 따르면 다음과 같습니다:

```markup
Statement[Yield, Await, Return] :
    ... lots of statements

Declaration[Yield, Await] :
    ... declarations
```

AST 위해 정의한 `Statement` 노드에 당연히 `Declaration`는 포함되지 않습니다,

하지만 Annex B의 `#sec-functiondeclarations-in-ifstatement-statement-clauses`,
에서는 비엄격 모드의 `if` 구문 내에 함수 선언 가능합니다 :

```javascript
if (x) function foo() {}
else function bar() {}
```

---

## Label statement is legit(라벨 구문은 합법)

라벨문을 한 줄도 작성해 본 적 없을 수 있지만, 최신 자바스크립트에서는 합법적이면서 엄격 모드에서 금지되지도 않습니다.

다음 구문은 올바른 구문으로 (객체 리터럴이 아닌) 라벨이 지정된 문을 반환합니다.

```javascript
<Foo
  bar={() => {
    baz: "quaz";
  }}
/>
//   ^^^^^^^^^^^ `LabelledStatement`
```

---

## `let` 키워드가 아닙니다

`let` 키워드가 아니므로 문법에 명시적으로 `let`이 특정 위치에 허용되지 않는다 명시되어 있지 않는 한 어디든 사용할 수 있습니다.
파서는 `let` 토큰 뒤에 오는 토큰을 들여다보고 파싱이 필요한 토큰을 결정해야 합니다. 예시:

```javascript
let a;
let = foo;
let instanceof x;
let + 1;
while (true) let;
a = let[0];
```

---

## For-in / For-of 및 [In] context

`#prod-ForInOfStatement`에서 `for-in`와 `for-of` 문법을 살펴보면,
파싱하는 방법에 대해 혼란스러워 질 것 입니다.

우리가 이해해야 할 두 가지 주요 장애물이 있습니다: `[lookahead ≠ let]`와 `[+In]`.

만약 우리가 `for (let`, 으로 파싱했다면 토큰이 무엇인지 확인해야 합니다:

- `in` 아닌 `for (let in)`을 허용하지 않습니다.
- `{`, `[` 또는 `for (let {} = foo)`, `for (let [] = foo)` 및 `for (let bar = foo)`를 허용하는 식별자입니다.

`of` 혹은 `in` 키워드에 도달하면 오른쪽 표현식을 올바른 [+In] 컨텍스트로 전달할 필요가 있음.
`#prod-RelationalExpression`의 두 표현 `in`:

```
RelationalExpression[In, Yield, Await] :
    [+In] RelationalExpression[+In, ?Yield, ?Await] in ShiftExpression[?Yield, ?Await]
    [+In] PrivateIdentifier in ShiftExpression[?Yield, ?Await]

Note 2: The [In] grammar parameter is needed to avoid confusing the in operator in a relational expression with the in operator in a for statement.
```

그리고 이것은 전체 사양에서 `[In]` 컨텍스트에 대한 유일한 적용입니다.

또한 주목할 점은 문법 `[lookahead ∉ { let, async of }]`은 `for (async of ...)` 금지하다는 점입니다,
그래서 명시적인 카드할 필요가 있습니다.

---

## Block-Level Function Declarations

Annex B.3.2 에 `#sec-block-level-function-declarations-web-legacy-compatibility-semantics`,
`FunctionDeclaration`가 `Block` 구문에서 어떻게 동작하는가 설명하기 위해 페이지 전체에 할애되어 있습니다.
요약하면

```javascript reference
https://github.com/acornjs/acorn/blob/11735729c4ebe590e406f952059813f250a4cbd1/acorn/src/scope.js#L30-L35
```

함수 선언 안에 있는 경우 `FunctionDeclaration`의 이름은 `var` 선언과 동일하게 취급해야 합니다.
이 코드 조각은 `bar`가 블록 범위 안에 있기 때문에 재선언 오류를 발생시킵니다:

```javascript
function foo() {
  if (true) {
    var bar;
    function bar() {} // redeclaration error
  }
}
```

한편 다음은 함수 범위 안에 있기 때문에 에러가 발생하지 않으며, 함수 `bar`는 var 선언으로 처리됩니다:

```javascript
function foo() {
  var bar;
  function bar() {}
}
```

---

## Grammar Context

구문 문법에는 특정 구문을 허용하고 허용하지 않는 5개의 컨텍스트 매개변수가 있습니다,
즉, `[In]`, `[Return]`, `[Yield]`, `[Await]` 및 `[Default]`입니다.

예를 들어 Rome에서는 구문 분석 중에 컨텍스트를 유지하는 것이 가장 좋습니다:

```rust reference
https://github.com/rome/tools/blob/5a059c0413baf1d54436ac0c149a829f0dfd1f4d/crates/rome_js_parser/src/state.rs#L404-L425
```

그리고 문법에 따라 이러한 플래그를 적절히 전환하고 확인합니다.

## AssignmentPattern vs BindingPattern

`estree`에서 `AssignmentExpression`의 왼쪽은 `Pattern`입니다:

```markup
extend interface AssignmentExpression {
    left: Pattern;
}
```

그리고 `VariableDeclarator`는 `Pattern` 입니다:

```markup
interface VariableDeclarator <: Node {
    type: "VariableDeclarator";
    id: Pattern;
    init: Expression | null;
}
```

`Pattern`은 `Identifier`, `ObjectPattern`, `ArrayPattern` 일 수 있습니다:

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

하지만 사양 관점에서 보면 다음과 같은 자바스크립트가 있습니다:

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

This starts to become confusing because we now have a situation where we cannot directly distinguish whether the `Identifier` is a `BindingIdentifier` or a `IdentifierReference`
inside a `Pattern`:

```rust
enum Pattern {
    Identifier, // Is this a `BindingIdentifier` or a `IdentifierReference`?
    ArrayPattern,
    ObjectPattern,
}
```

이렇게 하면 구문 분석기 파이프라인에서 모든 종류의 불필요한 코드가 더 아래로 내려가게 됩니다.
예를 들어, 의미 분석을 위한 범위를 설정할 때, 이 '식별자'의 부모를 검사하여 이 `Identifier`를 범위에 바인딩할지 여부를 결정해야 합니다.
즉, 부모를 검사하여 범위에 바인딩할지 여부를 결정해야 합니다.

더 나은 해결책은 사양을 완전히 이해하고 수행할 작업을 결정하는 것입니다.

`AssignmentExpression`과 `VariableDeclaration`의 문법은 다음과 같이 정의됩니다:

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

사양은 이 두 문법을 `AssignmentPattern`과 `BindingPattern`으로 별도로 정의하여 구분합니다.

따라서 이와 같은 상황에서는 `estree`에서 벗어나 구문 분석기를 위해 추가 AST 노드를 정의하는 것을 두려워하지 마세요:

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

마침내 깨달음을 얻을 때까지 일주일 내내 매우 혼란스러운 상태였습니다:
하나의 `패턴` 노드 대신 `AssignmentPattern` 노드와 `BindingPattern` 노드를 정의해야 한다는 것을요.

- `estree`가 옳음에 틀림이 없어. 몇 년이나 사용되었는데 틀릴리가 없지.
- 두 개의 개별 노드를 정의하지 않고 패턴 내부의 `Identifier`를 어떻게 깔끔하게 구분할 수 있을까?
- 하루 종일 사양을 본 후....
  "13.15 Assignment Operators" `AssignmentPattern`의 문법은 "13.15 Assignment Operators"의 5번째 하우 ㅣ섹션에 "보충 구문"이라 부제로 적혀있습니다.🤯 - 모든 문법이 "런타임 의미론" 섹션 이후에 정의된 문법이 아니라 메인 섹션에 정의되어 있기에 이는 정말 옳지 않습니다

---

:::caution
다음과 같은 경우는 정말 이해하기 어렵습니다. 여기 용이 있죠.
:::

## Ambiguous Grammar

먼저 파서처럼 생각하고 문제를 해결해 봅시다. `/` 토큰이 주어졌을 때 이것이 나눗셈 연산자인가, 아니면 정규식 표현식의 시작인가?

```javascript
a / b;
a / / regex /;
a /= / regex /;
/ regex / / b;
/=/ / /=/;
```

거의 불가능에 가깝지 않나요? 이를 세분화하여 문법을 따라가 봅시다.

가장 먼저 이해해야 할 것은 `#sec-ecmascript-language-lexical-grammar`에 명시된 대로 구문 문법이 어휘 문법을 주도한다는 것입니다.

> 어휘 입력 요소의 식별이 입력 요소를 소비하는 구문 문법 컨텍스트에 민감한 몇 가지 상황이 있습니다.

즉, 구문 분석기는 렉서에게 다음에 반환할 토큰을 알려줄 책임이 있습니다.
위의 예는 구문 분석기가 `/` 토큰 또는 `RegExp` 토큰 중 하나를 반환해야 함을 나타냅니다.
올바른 `/` 또는 `RegExp` 토큰을 얻기 위해 사양은 다음과 같이 말합니다.:

> InputElementRegExp 목표 기호는 정규 표현식 리터럴이 허용되는 모든 구문 문법 문맥에서 사용됩니다...
> 다른 모든 문맥에서는 InputElementDiv가 어휘 목표 기호로 사용됩니다.

`InputElementDiv`와 `InputElementRegExp` 구문은 다음과 같습니다.

```markup
InputElementDiv ::
    WhiteSpace
    LineTerminator
    Comment
    CommonToken
    DivPunctuator <---------- the `/` and `/=` token
    RightBracePunctuator

InputElementRegExp ::
    WhiteSpace
    LineTerminator
    Comment
    CommonToken
    RightBracePunctuator
    RegularExpressionLiteral <-------- the `RegExp` token
```

즉, 문법이 `RegularExpressionLiteral`에 도달할 때마다 `/`를 `RegExp` 토큰으로 토큰화해야 합니다(일치하는 `/`가 없는 경우 에러를 발생시킵니다).
다른 모든 경우에는 `/`를 슬래시 토큰으로 토큰화합니다.

예제를 살펴보겠습니다:

```
a / / regex /
^ ------------ PrimaryExpression:: IdentifierReference
  ^ ---------- MultiplicativeExpression: MultiplicativeExpression MultiplicativeOperator ExponentiationExpression
    ^^^^^^^^ - PrimaryExpression: RegularExpressionLiteral
```

이 구문은 `Statement`의 다른 시작 부분과 일치하지 않습니다,
따라서 `ExpressionStatement` 경로를 따릅니다:

`ExpressionStatement` --> `Expression` --> `AssignmentExpression` --> ... -->
`MultiplicativeExpression` --> ... -->
`MemberExpression` --> `PrimaryExpression` --> `IdentifierReference`.

우리는 `RegularExpressionLiteral`이 아닌 `IdentifierReference`에서 멈췄습니다,
"다른 모든 컨텍스트에서 InputElementDiv는 어휘 목표 기호로 사용됩니다."라는 문장이 적용됩니다.
첫 번째 슬래시는 `DivPunctuator` 토큰입니다.

이것은 `DivPunctuator` 토큰이므로,
문법 `MultiplicativeExpression: MultiplicativeExpression MultiplicativeOperator ExponentiationExpression` 문법이 일치합니다,

이제 `a / /`의 두 번째 슬래시에 도달했습니다.
확장 표현식`을 따라가면,
`PrimaryExpression: RegularExpressionLiteral`이 `/`와 일치하는 유일한 문법이기 때문에 `RegularExpressionLiteral`에 도달합니다:

```markup
RegularExpressionLiteral ::
    / RegularExpressionBody / RegularExpressionFlags
```

이 두 번째 `/`는 다음과 같은 이유로 `RegExp`로 토큰화됩니다.
사양에 "InputElementRegExp 목표 심볼은 RegularExpressionLiteral이 허용되는 모든 구문 문법 컨텍스트에서 사용됩니다." 라 명시되어 있기 때문입니다.

:::info
연습 삼아 `/=/ / /=/` 문법을 따라 해보세요.
:::

---

## Cover Grammar

이 주제에 대한 [V8의 글](https://v8.dev/blog/understanding-ecmascript-part-4)을 먼저 읽어보세요.

요약하자면, 사양에는 다음 세 가지 커버 문법이 명시되어 있습니다:

#### CoverParenthesizedExpressionAndArrowParameterList

```markup
PrimaryExpression[Yield, Await] :
    CoverParenthesizedExpressionAndArrowParameterList[?Yield, ?Await]

When processing an instance of the production
PrimaryExpression[Yield, Await] : CoverParenthesizedExpressionAndArrowParameterList[?Yield, ?Await]
    the interpretation of CoverParenthesizedExpressionAndArrowParameterList is refined using the following grammar:

ParenthesizedExpression[Yield, Await] :
    ( Expression[+In, ?Yield, ?Await] )
```

```markup
ArrowFunction[In, Yield, Await] :
    ArrowParameters[?Yield, ?Await] [no LineTerminator here] => ConciseBody[?In]

ArrowParameters[Yield, Await] :
    BindingIdentifier[?Yield, ?Await]
    CoverParenthesizedExpressionAndArrowParameterList[?Yield, ?Await]
```

이러한 정의는 이하과 같습니다:

```javascript
let foo = (a, b, c); // SequenceExpression
let bar = (a, b, c) => {}; // ArrowExpression
          ^^^^^^^^^ CoverParenthesizedExpressionAndArrowParameterList
```

이 문제를 해결하기 위한 간단하지만 번거로운 접근 방식은 먼저 `Vec<Expression>`으로 파싱하는 것입니다,
그런 다음 변환 함수를 작성하여 `ArrowParameters` 노드로 변환하는 것입니다. 즉, 각 개별 `Expression`을 `BindingPattern`으로 변환해야 합니다.

파서 내에서 스코프 트리를 작성하는 경우 주의해야 합니다,
즉, 파싱 중에 화살표 표현식에 대한 스코프를 생성합니다,
시퀀스 표현식에 대해서는 생성하지 않습니다,
이 작업을 수행하는 방법이 명확하지 않습니다. [esbuild](https://github.com/evanw/esbuild)는 임시 스코프를 먼저 생성하여 이 문제를 해결했습니다,
임시 스코프를 생성한 다음 `ArrowExpression`이 아닌 경우 삭제하는 방식으로 이 문제를 해결했습니다.

이는 [아키텍처 문서](https://github.com/evanw/esbuild/blob/master/docs/architecture.md#symbols-and-scopes)에 명시되어 있습니다:

>  파서가 범위를 밀고 선언을 구문 분석하는 도중에 선언이 선언이 아니라는 것을 발견하는 몇 군데를 제외하고는 대부분 매우 간단합니다. 이러한 문제는 TypeScript에서 함수가 본문 없이 포워드 선언된 경우, JavaScript에서 괄호로 묶인 표현식이 나중에 => 토큰에 도달할 때까지 화살표 함수인지 아닌지 모호한 경우 발생합니다. 이 문제는 두 번이 아닌 세 번을 수행하여 파싱을 완료한 후 범위 설정과 기호 선언을 시작하면 해결될 수 있지만, 여기서는 두 번으로 이 작업을 수행하려고 합니다. 따라서 나중에 가정이 틀린 것으로 판명될 경우 범위 트리를 수정하기 위해 popScope() 대신 popAndDiscardScope() 또는 popAndFlattenScope()를 호출합니다.

---

#### CoverCallExpressionAndAsyncArrowHead

```markup
CallExpression :
    CoverCallExpressionAndAsyncArrowHead

When processing an instance of the production
CallExpression : CoverCallExpressionAndAsyncArrowHead
the interpretation of CoverCallExpressionAndAsyncArrowHead is refined using the following grammar:

CallMemberExpression[Yield, Await] :
    MemberExpression[?Yield, ?Await] Arguments[?Yield, ?Await]
```

```markup
AsyncArrowFunction[In, Yield, Await] :
    CoverCallExpressionAndAsyncArrowHead[?Yield, ?Await] [no LineTerminator here] => AsyncConciseBody[?In]

CoverCallExpressionAndAsyncArrowHead[Yield, Await] :
    MemberExpression[?Yield, ?Await] Arguments[?Yield, ?Await]

When processing an instance of the production
AsyncArrowFunction : CoverCallExpressionAndAsyncArrowHead => AsyncConciseBody
the interpretation of CoverCallExpressionAndAsyncArrowHead is refined using the following grammar:

AsyncArrowHead :
    async [no LineTerminator here] ArrowFormalParameters[~Yield, +Await]
```

이하와 같이 정의합니다:

```javascript
async (a, b, c); // CallExpression
async (a, b, c) => {} // AsyncArrowFunction
^^^^^^^^^^^^^^^ CoverCallExpressionAndAsyncArrowHead
```

`async`가 키워드가 아니기 때문에 이상하게 보입니다. 첫 번째 `async`는 함수 이름입니다.

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

이하와 같이 정의합니다:

```javascript
({ prop = value } = {}); // ObjectAssignmentPattern
({ prop = value }); // ObjectLiteral with SyntaxError
```

파서는 `ObjectLiteral`을 `CoverInitializedName`으로 파싱해야 합니다,
에 도달하지 않으면 구문 에러를 발생시켜야 하며, `ObjectAssignmentPattern`에 대해 `=`에 도달하지 않으면 구문 에러를 발생시켜야 합니다.

연습을 위해 다음 중 어떤 `=`가 구문 오류를 던져야 할까요?

```javascript
let { x = 1 } = { x = 1 } = { x = 1 }
```
