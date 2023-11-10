---
id: typescript
title: TypeScript
---

자바스크립트 대신 타입스크립트 파싱에 도전하고 싶은가요?
나쁜 소식은 사양이 없다는 것,
좋은 소식은 타입스크립트 파서가 [단일 파일](https://github.com/microsoft/TypeScript/blob/main/src/compiler/parser.ts)이라는 것입니다 🙃.

## JSX vs TSX

이 코드,

```javascript
let foo = <string> bar;
```

이것이 `tsx` (마무리되지 않는 JSX)라면 구문 오류입니다,
그러나 이것이 `TSTypeAssertion` 사용한 `VariableDeclaration`라면 옳은 표현입니다.

## Lookahead

특정 위치에서는 파서가 올바른 문법을 결정하기 위해 두 개 이상의 토큰을 미리 살펴봐야 합니다.

### TSIndexSignature

예를 들어, `TSIndexSignature`를 파싱하려면 다음 두 가지 경우를 고려합니다:

```typescript
type A = { readonly [a: number]: string }
           ^__________________________^ TSIndexSignature

type B = { [a]: string }
           ^_________^ TSPropertySignature
```

먼저 `{`의 `type A`인 경우, 5개의 토큰(`readonly`, `[`, `a`, `:` 그리고 `number`)을 봐야합니다

이것은 `TSPropertySignature`가 아닌 `TSIndexSignature`입니다.

이를 가능하게 하고 효율적으로 하기 위해 lexer에는 여러 토큰을 저장할 수 있는 버퍼가 필요합니다.

### Arrow Expressions

[cover grammar](/blog/grammar#cover-grammar)에서 설명했듯이 `=>` 토큰을 발견한다면, `Expression`에서 `BindingPattern`으로 변환할 필요가 있습니다.

그러나 이 접근 방식은 `()` 안의 각 항목에 TypeScript 구문이 있을 수 있고, 예를 들어 다루어야 할 경우가 너무 많기 때문에 TypeScript에서는 작동하지 않습니다:

```typescript
<x>a, b as c, d!;
(a?: b = {} as c!) => {};
```

이 특정 사례에 대해서는 TypeScript 소스 코드를 공부하는 것이 좋습니다. 관련 코드는 이하와 같습니다:

```typescript
function tryParseParenthesizedArrowFunctionExpression(
  allowReturnTypeInArrowFunction: boolean
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
        /*allowReturnTypeInArrowFunction*/ true
      )
    : tryParse(() =>
        parsePossibleParenthesizedArrowFunctionExpression(
          allowReturnTypeInArrowFunction
        )
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

요약하면, 타입스크립트 파서는 lookahead(빠른 경로)와 백트래킹을 조합하여 화살표 함수를 구문 분석합니다.