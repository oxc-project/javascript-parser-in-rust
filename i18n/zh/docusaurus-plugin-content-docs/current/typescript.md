---
id: typescript
title: TypeScript
---

So you are done with JavaScript and you want to challenge parsing TypeScript?
The bad news is that there is no specification,
but the good news is that the TypeScript parser is in [a single file](https://github.com/microsoft/TypeScript/blob/main/src/compiler/parser.ts) 🙃.

## JSX vs TSX

For the following code,

```javascript
let foo = <string> bar;
```

It is a syntax error if this is `tsx` (Unterminated JSX),
but it is correct `VariableDeclaration` with `TSTypeAssertion`.

## Lookahead

In certain places, the parser need to lookahead and peek more than one token to determine the correct grammar.

### TSIndexSignature

For example, to parse `TSIndexSignature`, consider the following two cases:

```typescript
type A = { readonly [a: number]: string }
           ^__________________________^ TSIndexSignature

type B = { [a]: string }
           ^_________^ TSPropertySignature
```

For `type A` on the first `{`, we need to peek 5 tokens (`readonly`, `[`, `a`, `:` and `number`) in order to make sure
it is a `TSIndexSignature` and not a `TSPropertySignature`.

To make this possible and efficient, the lexer requires a buffer for storing multiple tokens.

### Arrow Expressions

Discussed in [cover grammar](/blog/grammar#cover-grammar),
we need to convert from `Expression`s to `BindingPattern`s when the `=>` token is found after a SequenceExpression.

But this approach does not work for TypeScript as each item inside the `()` can have TypeScript syntax, there are just too many cases to cover, for example:

```typescript
<x>a, b as c, d!;
(a?: b = {} as c!) => {};
```

It is recommended to study the TypeScript source code for this specific case. The relevant code are:

```typescript
function tryParseParenthesizedArrowFunctionExpression(
  allowReturnTypeInArrowFunction: boolean,
): Expression | undefined {
  const triState = isParenthesizedArrowFunctionExpression();
  if (triState === Tristate.False) {
    // It's definitely not a parenthesized arrow function expression.
    return undefined;
  }

  // If we definitely have an arrow function, then we can just parse one, not requiring a
  // following => or { token. Otherwise, we *might* have an arrow function.  Try to parse
  // it out, but don't allow any ambiguity, and return 'undefined' if this could be an
  // expression instead.
  return triState === Tristate.True
    ? parseParenthesizedArrowFunctionExpression(
        /*allowAmbiguity*/ true,
        /*allowReturnTypeInArrowFunction*/ true,
      )
    : tryParse(() =>
        parsePossibleParenthesizedArrowFunctionExpression(
          allowReturnTypeInArrowFunction,
        ),
      );
}

//  True        -> We definitely expect a parenthesized arrow function here.
//  False       -> There *cannot* be a parenthesized arrow function here.
//  Unknown     -> There *might* be a parenthesized arrow function here.
//                 Speculatively look ahead to be sure, and rollback if not.
function isParenthesizedArrowFunctionExpression(): Tristate {
  if (
    token() === SyntaxKind.OpenParenToken ||
    token() === SyntaxKind.LessThanToken ||
    token() === SyntaxKind.AsyncKeyword
  ) {
    return lookAhead(isParenthesizedArrowFunctionExpressionWorker);
  }

  if (token() === SyntaxKind.EqualsGreaterThanToken) {
    // ERROR RECOVERY TWEAK:
    // If we see a standalone => try to parse it as an arrow function expression as that's
    // likely what the user intended to write.
    return Tristate.True;
  }
  // Definitely not a parenthesized arrow function.
  return Tristate.False;
}
```

In summary, the TypeScript parser uses a combination of lookahead (fast path) and backtracking to parse arrow functions.
