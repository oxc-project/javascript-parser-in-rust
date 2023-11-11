---
id: typescript
title: TypeScript
---

JavaScript を終えて、TypeScript の解析に挑戦したいと思っていますか？
悪いニュースは、仕様が存在しないことですが、良いニュースは、TypeScript のパーサーが[ 単一のファイル](https://github.com/microsoft/TypeScript/blob/main/src/compiler/parser.ts) にあることです 🙃。

## JSX vs TSX

次のコードについて、

```javascript
let foo = <string> bar;
```

これが `tsx` の場合は構文エラーです（Unterminated JSX）が、`VariableDeclaration` と `TSTypeAssertion` の正しいものです。

## 先読み

特定の場所では、パーサーは正しい文法を判断するために、複数のトークンを先読みして覗き見る必要があります。

### TSIndexSignature

たとえば、`TSIndexSignature` を解析する場合、次の2つのケースを考慮してください：

```typescript
type A = { readonly [a: number]: string }
           ^__________________________^ TSIndexSignature

type B = { [a]: string }
           ^_________^ TSPropertySignature
```

最初の `{` の `type A` の場合、`readonly`、`[`、`a`、`:`、`number` の5つのトークンを先読みする必要があります。
これにより、`TSIndexSignature` であることを確認し、`TSPropertySignature` ではないことを確認します。

これを可能にし、効率的にするために、字句解析器は複数のトークンを格納するバッファを必要とします。

### Arrow Expressions

[Cover Grammar](/blog/grammar#cover-grammar) で議論されているように、`=>` トークンがSequenceExpressionの後に見つかった場合、`Expression` を`BindingPattern` に変換する必要があります。

しかし、これは TypeScript では機能しません。`()` 内の各アイテムには TypeScript の構文が含まれる可能性があり、対応するケースが多すぎます。例えば：

```typescript
<x>a, b as c, d!;
(a?: b = {} as c!) => {};
```

この特定のケースについては、TypeScript のソースコードを学ぶことをお勧めします。関連するコードは次のとおりです：

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

要約すると、TypeScript のパーサーは、先読み（高速パス）とバックトラッキングの組み合わせを使用して、アロー関数を解析します。
