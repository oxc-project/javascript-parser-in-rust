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
but it is correct "VariableDeclaration" with `TSTypeAssertion`.

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

Discussed in [/blog/grammar#cover-grammar],
we need to convert from `Expression`s to `BindingPattern`s when the `=>` token is found after a SequenceExpression.

But this approach does not work really well for TypeScript as each item inside the `()` can have TypeScript syntax, there are just too many cases to cover.

```typescript
<x>a, b as c, d!;
(a?: b = {} as c!) => {};
```

Different parsers take different approaches:

#### TypeScript

TODO

#### Rome

TODO

#### swc

TODO

#### esbuild

- TODO
