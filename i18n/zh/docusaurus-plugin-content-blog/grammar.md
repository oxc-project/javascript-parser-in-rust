---
title: Grammar
---

JavaScript has one of the most challenging grammar to parse,
this tutorial details all the sweat and tears I had while learning it.

<!--truncate-->

## LL(1) Grammar

According to [Wikipedia](https://en.wikipedia.org/wiki/LL_grammar),

> an LL grammar is a context-free grammar that can be parsed by an LL parser, which parses the input from Left to right

The first **L** means the scanning the source from **L**eft to right,
and the second **L** means the construction of a **L**eftmost derivation tree.

Context-free and the (1) in LL(1) means a tree can be constructed by just peeking at the next token and nothing else.

LL Grammars are of particular interest in academia because we are lazy human beings and we want to write programs that generate parsers automatically so we don't need to write parsers by hand.

Unfortunately, most industrial programming languages do not have a nice LL(1) grammar,
and this applies to JavaScript too.

:::info
Mozilla started the [jsparagus](https://github.com/mozilla-spidermonkey/jsparagus) project a few years ago
and wrote a [LALR parser generator in Python](https://github.com/mozilla-spidermonkey/jsparagus/tree/master/jsparagus).
They haven't updated it much in the past two years and they sent a strong message at the end of [js-quirks.md](https://github.com/mozilla-spidermonkey/jsparagus/blob/master/js-quirks.md)

> What have we learned today?
>
> - Do not write a JS parser.
> - JavaScript has some syntactic horrors in it. But hey, you don't make the world's most widely used programming language by avoiding all mistakes. You do it by shipping a serviceable tool, in the right circumstances, for the right users.

:::

---

The only practical way to parse JavaScript is to write a recursive descent parser by hand because of the nature of its grammar,
so let's learn all the quirks in the grammar before we shoot ourselves in the foot.

The list below starts simple and will become difficult to grasp,
so please grab a coffee and take your time.

## Identifiers

There are three types of identifiers defined in `#sec-identifiers`,

```markup
IdentifierReference[Yield, Await] :
BindingIdentifier[Yield, Await] :
LabelIdentifier[Yield, Await] :
```

`estree` and some ASTs do not distinguish the above identifiers,
and the specification does not explain them in plain text.

`BindingIdentifier`s are declarations and `IdentifierReference`s are references to binding identifiers.
For example in `var foo = bar`, `foo` is a `BindingIdentifier` and `bar` is a `IdentifierReference` in the grammar:

```markup
VariableDeclaration[In, Yield, Await] :
    BindingIdentifier[?Yield, ?Await] Initializer[?In, ?Yield, ?Await] opt

Initializer[In, Yield, Await] :
    = AssignmentExpression[?In, ?Yield, ?Await]
```

follow `AssignmentExpression` into `PrimaryExpression` we get

```markup
PrimaryExpression[Yield, Await] :
    IdentifierReference[?Yield, ?Await]
```

Declaring these identifiers differently in the AST will greatly simply downstream tools, especially for semantic analysis.

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

## Class and Strict Mode

ECMAScript Class is born after strict mode, so they decided that everything inside a class must be strict mode for simplicity.
It is stated as such in `#sec-class-definitions` with just a `Node: A class definition is always strict mode code.`

It is easy to declare strict mode by associating it with function scopes, but a `class` declaration does not have a scope,
we need to keep an extra state just for parsing classes.

```rust reference
https://github.com/swc-project/swc/blob/f9c4eff94a133fa497778328fa0734aa22d5697c/crates/swc_ecma_parser/src/parser/class_and_fn.rs#L85
```

---

## Legacy Octal and Use Strict

`#sec-string-literals-early-errors` disallows escaped legacy octal inside strings `"\01"`:

```markup
EscapeSequence ::
    LegacyOctalEscapeSequence
    NonOctalDecimalEscapeSequence

It is a Syntax Error if the source text matched by this production is strict mode code.
```

The best place to detect this is inside the lexer, it can ask the parser for strict mode state and throw errors accordingly.

But, this becomes impossible when mixed with directives:

```javascript reference
https://github.com/tc39/test262/blob/747bed2e8aaafe8fdf2c65e8a10dd7ae64f66c47/test/language/literals/string/legacy-octal-escape-sequence-prologue-strict.js#L16-L19
```

`use strict` is declared after the escaped legacy octal, yet the syntax error needs to be thrown.
Fortunately, no real code uses directives with legacy octals ... unless you want to pass the test262 case from above.

---

## Non-simple Parameter and Strict Mode

Identical function parameters is allowed in non-strict mode `function foo(a, a) { }`,
and we can forbid this by adding `use strict`: `function foo(a, a) { "use strict" }`.
Later on in es6, other grammars were added to function parameters, for example `function foo({ a }, b = c) {}`.

Now, what happens if we write the following where "01" is a strict mode error?

```javaScript
function foo(value=(function() { return "\01" }())) {
    "use strict";
    return value;
}
```

More specifically, what should we do if there is a strict mode syntax error inside the parameters thinking from the parser perspective?
So in `#sec-function-definitions-static-semantics-early-errors`, it just bans this by stating

```markup
FunctionDeclaration :
FunctionExpression :

It is a Syntax Error if FunctionBodyContainsUseStrict of FunctionBody is true and IsSimpleParameterList of FormalParameters is false.
```

Chrome throws this error with a mysterious message "Uncaught SyntaxError: Illegal 'use strict' directive in function with non-simple parameter list".

A more in-depth explanation is described in [this blog post](https://humanwhocodes.com/blog/2016/10/the-ecmascript-2016-change-you-probably-dont-know/) by the author of ESLint.

:::info

Fun fact, the above rule does not apply if we are targeting `es5` in TypeScript, it transpiles to

```javaScript
function foo(a, b) {
    "use strict";
    if (b === void 0) { b = "\01"; }
}
```

:::

---

## Parenthesized Expression

Parenthesized expressions are supposed to not have any semantic meanings?
For instance the AST for `((x))` can just be a single `IdentifierReference`, not `ParenthesizedExpression` -> `ParenthesizedExpression` -> `IdentifierReference`.
And this is the case for JavaScript grammar.

But ... who would have thought it can have run-time meanings.
Found in [this estree issue](https://github.com/estree/estree/issues/194), it shows that

```javascript
> fn = function () {};
> fn.name
< "fn"

> (fn) = function () {};
> fn.name
< ''
```

So eventually acorn and babel added the `preserveParens` option for compatibility.

---

## Function Declaration in If Statement

If we follow the grammar precisely in `#sec-ecmascript-language-statements-and-declarations`:

```markup
Statement[Yield, Await, Return] :
    ... lots of statements

Declaration[Yield, Await] :
    ... declarations
```

The `Statement` node we define for our AST would obviously not contain `Declaration`,

but in Annex B `#sec-functiondeclarations-in-ifstatement-statement-clauses`,
it allows declaration inside the statement position of `if` statements in non-strict mode:

```javascript
if (x) function foo() {}
else function bar() {}
```

---

## Label statement is legit

We probably have never written a single line of labelled statement, but it is legit in modern JavaScript and not banned by strict mode.

The following syntax is correct, it returns a labelled statement (not object literal).

```javascript
<Foo
  bar={() => {
    baz: "quaz";
  }}
/>
//   ^^^^^^^^^^^ `LabelledStatement`
```

---

## `let` is not a keyword

`let` is not a keyword so it is allowed to appear anywhere unless the grammar explicitly states `let` is not allowed in such positions.
Parsers need to peek at the token after the `let` token and decide what it needs to be parsed into, e.g.:

```javascript
let a;
let = foo;
let instanceof x;
let + 1;
while (true) let;
a = let[0];
```

---

## For-in / For-of and the [In] context

If we look at the grammar for `for-in` and `for-of` in `#prod-ForInOfStatement`,
it is immediately confusing to understand how to parse these.

There are two major obstacles for us to understand: the `[lookahead ≠ let]` part and the `[+In]` part.

If we have parsed to `for (let`, we need to check the peeking token is:

- not `in` to disallow `for (let in)`
- is `{`, `[` or an identifier to allow `for (let {} = foo)`, `for (let [] = foo)` and `for (let bar = foo)`

Once reached the `of` or `in` keyword, the right-hand side expression needs to be passed with the correct [+In] context to disallow
the two `in` expressions in `#prod-RelationalExpression`:

```
RelationalExpression[In, Yield, Await] :
    [+In] RelationalExpression[+In, ?Yield, ?Await] in ShiftExpression[?Yield, ?Await]
    [+In] PrivateIdentifier in ShiftExpression[?Yield, ?Await]

Note 2: The [In] grammar parameter is needed to avoid confusing the in operator in a relational expression with the in operator in a for statement.
```

And this is the only application for the `[In]` context in the entire specification.

Also to note, the grammar `[lookahead ∉ { let, async of }]` forbids `for (async of ...)`,
and it needs to be explicitly guarded against.

---

## Block-Level Function Declarations

In Annex B.3.2 `#sec-block-level-function-declarations-web-legacy-compatibility-semantics`,
an entire page is dedicated to explain how `FunctionDeclaration` is supposed to behave in `Block` statements.
It boils down to

```javascript reference
https://github.com/acornjs/acorn/blob/11735729c4ebe590e406f952059813f250a4cbd1/acorn/src/scope.js#L30-L35
```

The name of a `FunctionDeclaration` needs to be treated the same as a `var` declaration if its inside a function declaration.
This code snippet errors with a re-declaration error since `bar` is inside a block scope:

```javascript
function foo() {
  if (true) {
    var bar;
    function bar() {} // redeclaration error
  }
}
```

meanwhile, the following does not error because it is inside a function scope, function `bar` is treated as a var declaration:

```javascript
function foo() {
  var bar;
  function bar() {}
}
```

---

## Grammar Context

The syntactic grammar has 5 context parameters for allowing and disallowing certain constructs,
namely `[In]`, `[Return]`, `[Yield]`, `[Await]` and `[Default]`.

It is best to keep a context during parsing, for example in Rome:

```rust reference
https://github.com/rome/tools/blob/5a059c0413baf1d54436ac0c149a829f0dfd1f4d/crates/rome_js_parser/src/state.rs#L404-L425
```

And toggle and check these flags accordingly by following the grammar.

## AssignmentPattern vs BindingPattern

In `estree`, the left-hand side of an `AssignmentExpression` is a `Pattern`:

```markup
extend interface AssignmentExpression {
    left: Pattern;
}
```

and the left-hand side of a `VariableDeclarator` is a `Pattern`:

```markup
interface VariableDeclarator <: Node {
    type: "VariableDeclarator";
    id: Pattern;
    init: Expression | null;
}
```

A `Pattern` can be a `Identifier`, `ObjectPattern`, `ArrayPattern`:

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

But from the specification perspective, we have the following JavaScript:

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

This will lead to all sorts of unnecessary code further down the parser pipeline.
For example, when setting up the scope for semantic analysis, we need to inspect the parents of this `Identifier`
to determine whether we should bind it to the scope or not.

A better solution is to fully understand the specification and decide what to do.

The grammar for `AssignmentExpression` and `VariableDeclaration` are defined as:

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

The specification distinguishes this two grammar by defining them separately with an `AssignmentPattern` and a `BindingPattern`.

So in situations like this, do not be afraid to deviate from `estree` and define extra AST nodes for our parser:

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

I was in a super confusing state for a whole week until I finally reached enlightenment:
we need to define an `AssignmentPattern` node and a `BindingPattern` node instead of a single `Pattern` node.

- `estree` must be correct because people have been using it for years so it cannot be wrong?
- how are we going to cleanly distinguish the `Identifier`s inside the patterns without defining two separate nodes?
  I just cannot find where the grammar is?
- After a whole day of navigating the specification ...
  the grammar for `AssignmentPattern` is in the 5th subsection of the main section "13.15 Assignment Operators" with the subtitle "Supplemental Syntax" 🤯 -
  this is really out of place because all grammar is defined in the main section, not like this one defined after the "Runtime Semantics" section

---

:::caution
The following cases are really difficult to grasp. Here be dragons.
:::

## Ambiguous Grammar

Let's first think like a parser and solve the problem - given the `/` token, is it a division operator or the start of a regex expression?

```javascript
a / b;
a / / regex /;
a /= / regex /;
/ regex / / b;
/=/ / /=/;
```

It is almost impossible, isn't it? Let's break these down and follow the grammar.

The first thing we need to understand is that the syntactic grammar drives the lexical grammar as stated in `#sec-ecmascript-language-lexical-grammar`

> There are several situations where the identification of lexical input elements is sensitive to the syntactic grammar context that is consuming the input elements.

This means that the parser is responsible for telling the lexer which token to return next.
The above example indicates that the lexer needs to return either a `/` token or a `RegExp` token.
For getting the correct `/` or `RegExp` token, the specification says:

> The InputElementRegExp goal symbol is used in all syntactic grammar contexts where a RegularExpressionLiteral is permitted ...
> In all other contexts, InputElementDiv is used as the lexical goal symbol.

And the syntax for `InputElementDiv` and `InputElementRegExp` are

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

This means whenever the grammar reaches `RegularExpressionLiteral`, `/` need to be tokenized as a `RegExp` token (and throw an error if it does not have a matching `/`).
All other cases we'll tokenize `/` as a slash token.

Let's walk through an example:

```
a / / regex /
^ ------------ PrimaryExpression:: IdentifierReference
  ^ ---------- MultiplicativeExpression: MultiplicativeExpression MultiplicativeOperator ExponentiationExpression
    ^^^^^^^^ - PrimaryExpression: RegularExpressionLiteral
```

This statement does not match any other start of `Statement`,
so it'll go down the `ExpressionStatement` route:

`ExpressionStatement` --> `Expression` --> `AssignmentExpression` --> ... -->
`MultiplicativeExpression` --> ... -->
`MemberExpression` --> `PrimaryExpression` --> `IdentifierReference`.

We stopped at `IdentifierReference` and not `RegularExpressionLiteral`,
the statement "In all other contexts, InputElementDiv is used as the lexical goal symbol" applies.
The first slash is a `DivPunctuator` token.

Since this is a `DivPunctuator` token,
the grammar `MultiplicativeExpression: MultiplicativeExpression MultiplicativeOperator ExponentiationExpression` is matched,
the right-hand side is expected to be an `ExponentiationExpression`.

Now we are at the second slash in `a / /`.
By following `ExponentiationExpression`,
we reach `PrimaryExpression: RegularExpressionLiteral` because `RegularExpressionLiteral` is the only matching grammar with a `/`:

```markup
RegularExpressionLiteral ::
    / RegularExpressionBody / RegularExpressionFlags
```

This second `/` will be tokenized as `RegExp` because
the specification states "The InputElementRegExp goal symbol is used in all syntactic grammar contexts where a RegularExpressionLiteral is permitted".

:::info
As an exercise, try and follow the grammar for `/=/ / /=/`.
:::

---

## Cover Grammar

Read the [V8 blog post](https://v8.dev/blog/understanding-ecmascript-part-4) on this topic first.

To summarize, the specification states the following three cover grammars:

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

These definitions defines:

```javascript
let foo = (a, b, c); // SequenceExpression
let bar = (a, b, c) => {}; // ArrowExpression
          ^^^^^^^^^ CoverParenthesizedExpressionAndArrowParameterList
```

A simple but cumbersome approach to solving this problem is to parse it as a `Vec<Expression>` first,
then write a converter function to convert it to `ArrowParameters` node, i.e. each individual `Expression` need to be converted to a `BindingPattern`.

It should be noted that, if we are building the scope tree within the parser,
i.e. create the scope for arrow expression during parsing,
but do not create one for a sequence expression,
it is not obvious how to do this. [esbuild](https://github.com/evanw/esbuild) solved this problem by creating a temporary scope first,
and then dropping it if it is not an `ArrowExpression`.

This is stated in its [architecture document](https://github.com/evanw/esbuild/blob/master/docs/architecture.md#symbols-and-scopes):

> This is mostly pretty straightforward except for a few places where the parser has pushed a scope and is in the middle of parsing a declaration only to discover that it's not a declaration after all. This happens in TypeScript when a function is forward-declared without a body, and in JavaScript when it's ambiguous whether a parenthesized expression is an arrow function or not until we reach the => token afterwards. This would be solved by doing three passes instead of two so we finish parsing before starting to set up scopes and declare symbols, but we're trying to do this in just two passes. So instead we call popAndDiscardScope() or popAndFlattenScope() instead of popScope() to modify the scope tree later if our assumptions turn out to be incorrect.

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

These definitions define:

```javascript
async (a, b, c); // CallExpression
async (a, b, c) => {} // AsyncArrowFunction
^^^^^^^^^^^^^^^ CoverCallExpressionAndAsyncArrowHead
```

This looks strange because `async` is not a keyword. The first `async` is a function name.

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

These definitions define:

```javascript
({ prop = value } = {}); // ObjectAssignmentPattern
({ prop = value }); // ObjectLiteral with SyntaxError
```

Parsers need to parse `ObjectLiteral` with `CoverInitializedName`,
and throw the syntax error if it does not reach `=` for `ObjectAssignmentPattern`.

As an exercise, which one of the following `=` should throw a syntax error?

```javascript
let { x = 1 } = { x = 1 } = { x = 1 }
```
