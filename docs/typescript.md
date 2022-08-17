---
id: typescript
title: TypeScript
---

So you are done with JavaScript and you want to challenge parsing TypeScript?
The bad news is that there is no specification,
but the good news is that the TypeScript compiler is in [a single file](https://github.com/microsoft/TypeScript/blob/main/src/compiler/parser.ts) 🙃.

## JSX vs TSX

For the following code,

```javascript
let foo = <string> bar;
```

It is a syntax error if this is `tsx` (Unterminated JSX),
but it is correct "VariableDeclaration" with `TSTypeAssertion`.

## Peek for more tokens

In certain places, the parser need to peek more than one token to determine the correct grammar.

For example to parse TSIndexSignature, considier the following two cases:

```typescript
type A = { readonly [a: number]: string }
           ^__________________________^ TSIndexSignature

type B = { [a]: string }
           ^_________^ TSPropertySignature
```

For `type A` at the first `{`, we need to peek 5 tokens (`readonly`, `[`, `a`, `:` and `number`) in order to make sure
it is a `TSIndexSignature` and not a `TSPropertySignature`.

To make this possible and efficient, the lexer requires a buffer for storing multiple tokens.
