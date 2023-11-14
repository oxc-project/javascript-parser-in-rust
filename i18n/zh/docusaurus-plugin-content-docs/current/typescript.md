---
id: typescript
title: TypeScript
---

所以你已经完成了JavaScript，现在想要挑战解析TypeScript了？坏消息是没有规范，但好消息是TypeScript解析器在[一个单一文件](https://github.com/microsoft/TypeScript/blob/main/src/compiler/parser.ts)中 🙃。

## JSX vs TSX

对于以下代码，

```javascript
let foo = <string> bar;
```

如果这是`tsx`，那么这是一个语法错误（未终止的JSX），但如果是`VariableDeclaration`和`TSTypeAssertion`，那么这是正确的。

## 前向查找 (lookahead)

在某些地方，解析器需要向前查找并查看多个 token 以决定正确的语法。

### TSIndexSignature

例如，为了解析`TSIndexSignature`，考虑以下两种情况：

```typescript
type A = { readonly [a: number]: string }
           ^__________________________^ TSIndexSignature

type B = { [a]: string }
           ^_________^ TSPropertySignature
```

对于第一个`type A`中的`{`，我们需要向前查看5个 token （`readonly`、`[`、`a`、`:` 和 `number`）以确保它是`TSIndexSignature`而不是`TSPropertySignature`。

为了实现这一点并提高效率，词法分析器需要一个缓冲区来存储多个 token 。

### 箭头表达式

在[cover grammar](/blog/grammar#cover-grammar)中讨论过，当在 SequenceExpression 后面找到`=>` token 时，我们需要将`Expression`转换为`BindingPattern`。

但是对于TypeScript来说，这种方法不适用，因为`()`中的每个项目都可能有TypeScript语法，有太多情况需要考虑，例如：

```typescript
<x>a, b as c, d!;
(a?: b = {} as c!) => {};
```

建议研究TypeScript源代码来处理这个问题。相关代码如下：

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

总之，TypeScript解析器结合了先行查找（快速路径）和回溯来解析箭头函数。
