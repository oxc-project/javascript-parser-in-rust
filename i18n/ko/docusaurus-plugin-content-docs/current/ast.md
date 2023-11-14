---
id: ast
title: Abstract Syntax Tree
---

다음 장의 파서는 토큰을 추상 구문 트리(AST)로 변환하는 역할을 담당합니다.
소스 텍스트에 비해 AST에서 작업하는 것이 훨씬 더 좋습니다.

예를 들어 모든 자바스크립트 도구는 AST 수준에서 작동합니다:

- linter(예: eslint)는 AST에 오류가 있는지 확인합니다.
- formatter(예: prettier)는 AST를 자바스크립트 텍스트로 다시 인쇄합니다.
- minifier(예: terser)는 AST를 변환합니다.
- bundler는 서로 다른 파일에 있는 AST 간의 모든 import문 및 export문을 연결합니다.

이 장에서는 Rust 구조체와 열거형을 사용하여 JavaScript AST를 구성해 보겠습니다.

## Getting familiar with the AST(AST와 친해지기)

AST와 친해지기 위해 [ASTExplorer](https://astexplorer.net/)를 방문하여 어떤 모습인지 살펴봅시다.
상단 패널에서 JavaScript를 선택한 다음 `acron`를 선택하고 `var a`를 입력하면 트리 뷰와 JSON 뷰가 표시됩니다.

```json
{
  "type": "Program",
  "start": 0,
  "end": 5,
  "body": [
    {
      "type": "VariableDeclaration",
      "start": 0,
      "end": 5,
      "declarations": [
        {
          "type": "VariableDeclarator",
          "start": 4,
          "end": 5,
          "id": {
            "type": "Identifier",
            "start": 4,
            "end": 5,
            "name": "a"
          },
          "init": null
        }
      ],
      "kind": "var"
    }
  ],
  "sourceType": "script"
}
```

이것은 트리이므로 모든 객체는 타입 이름(예: `Program`, `VariableDeclaration`, `VariableDeclarator`, `Identifier`)을 가진 노드입니다.
`start`과 `end`은 소스로부터의 오프셋입니다.

## estree

[estree](https://github.com/estree/estree)는 자바스크립트를 위한 커뮤니티 표준 문법 사양입니다,
[모든 AST 노드](https://github.com/estree/estree/blob/master/es5.md)를 정의하여 다양한 도구가 서로 호환될 수 있도록
서로 호환될 수 있도록 정의합니다.

모든 AST 노드의 기본 빌딩 블록은 `Node` 타입입니다:

```rust
#[derive(Debug, Default, Clone, Copy, Serialize, PartialEq, Eq)]
pub struct Node {
    /// Start offset in source
    pub start: usize,

    /// End offset in source
    pub end: usize,
}

impl Node {
    pub fn new(start: usize, end: usize) -> Self {
        Self { start, end }
    }
}
```

`var a`에 대한 AST는 다음과 같이 정의됩니다.

```rust
pub struct Program {
    pub node: Node,
    pub body: Vec<Statement>,
}

pub enum Statement {
    VariableDeclarationStatement(VariableDeclaration),
}

pub struct VariableDeclaration {
    pub node: Node,
    pub declarations: Vec<VariableDeclarator>,
}

pub struct VariableDeclarator {
    pub node: Node,
    pub id: BindingIdentifier,
    pub init: Option<Expression>,
}

pub struct BindingIdentifier {
    pub node: Node,
    pub name: String,
}

pub enum Expression {
}
```

Rust에는 상속이 없으므로 각 구조체에 `Node`가 추가됩니다(이를 "상속을 통한 구성"이라고 함).

`Statement`와 `Expression`은 열거형인데, 예를 들어 다른 많은 노드 타입으로 확장될 것이기 때문입니다:

```rust
pub enum Expression {
    AwaitExpression(AwaitExpression),
    YieldExpression(YieldExpression),
}

pub struct AwaitExpression {
    pub node: Node,
    pub expression: Box<Expression>,
}

pub struct YieldExpression {
    pub node: Node,
    pub expression: Box<Expression>,
}
```

Rust에서는 self-referential struct가 허용되지 않기 때문에 `Box`가 필요합니다.

:::info
자바스크립트 문법에는 귀찮은 부분이 많으니 [grammar tutorial](/blog/grammar)을 한 번 확인해주세요.
:::

## Rust Optimizations

### Memory Allocations

[Overview](./overview.md) 장으로 돌아갑니다,
힙 할당 비용이 저렴하지 않기 때문에 `Vec`, `Box`와 같은 힙 할당 구조체를 주의해야 한다고 간략하게 언급했습니다.

[swc의 실제 구현](https://github.com/swc-project/swc/blob/main/crates/swc_ecma_ast/src/expr.rs)을 살펴보세요,
AST에는 많은 `Box`와 `Vec`이 있을 수 있으며, `Statement`와 `Expression` 열거형에는 열거형 변형을 포함하고 있습니다.

### Enum Size

우리가 만들 첫번째 최적화는 열거값의 크기를 줄이는 것입니다.

Rust 열거의 바이트 크기는 모든 변형의 합으로 알려져 있습니다.
예를 들어 다음 열거형은 56바이트(태그의 경우 1바이트, 페이로드의 경우 48바이트, 정렬의 경우 8바이트)를 차지합니다.

```rust
enum Name {
    Anonymous, // 0 byte payload
    Nickname(String), // 24 byte payload
    FullName{ first: String, last: String }, // 48 byte payload
}
```

:::note
이 예는 [블로그](https://adeschamps.github.io/enum-size) 에서 가져온 것입니다
:::

`Expression`와 `Statement`의 경우 현재 설정으로 최대 200바이트 이상을 사용할 수 있습니다.

이 200 바이트는 `matches!'(expr, Expression::AwaitExpression(__))` 체크해, 성능면에서 캐시 친화적이지 않습니다.

더 나은 접근 방식은 enum variants을 박스화하고 16바이트만 운반하는 것입니다.

```rust
pub enum Expression {
    AwaitExpression(Box<AwaitExpression>),
    YieldExpression(Box<YieldExpression>),
}

pub struct AwaitExpression {
    pub node: Node,
    pub expression: Expression,
}

pub struct YieldExpression {
    pub node: Node,
    pub expression: Expression,
}
```

64비트 시스템에서 숫자가 실제로 16바이트인지 확인하려면 `std::mem::size_of`를 사용할 수 있습니다.

```rust
#[test]
fn no_bloat_enum_sizes() {
    use std::mem::size_of;
    assert_eq!(size_of::<Statement>(), 16);
    assert_eq!(size_of::<Expression>(), 16);
}
```

"no bloat enum size" 테스트 사례는 작은 enum size를 보장하기 위한 Rust 컴파일러 소스 코드에서 종종 볼 수 있습니다.

```rust reference
https://github.com/rust-lang/rust/blob/9c20b2a8cc7588decb6de25ac6a7912dcef24d65/compiler/rustc_ast/src/ast.rs#L3033-L3042
```

다른 large type를 찾기 위해 실행할 수 있습니다

```bash
RUSTFLAGS=-Zprint-type-sizes cargo +nightly build -p name_of_the_crate --release
```

보시죠

```markup
print-type-size type: `ast::js::Statement`: 16 bytes, alignment: 8 bytes
print-type-size     discriminant: 8 bytes
print-type-size     variant `BlockStatement`: 8 bytes
print-type-size         field `.0`: 8 bytes
print-type-size     variant `BreakStatement`: 8 bytes
print-type-size         field `.0`: 8 bytes
print-type-size     variant `ContinueStatement`: 8 bytes
print-type-size         field `.0`: 8 bytes
print-type-size     variant `DebuggerStatement`: 8 bytes
print-type-size         field `.0`: 8 bytes
```

#### Memory Arena

AST에 글로벌 메모리 할당기를 사용하는 것은 실제로 효율적이지 않습니다.
모든 `Box`와 `Vec`는 요청에 따라 할당된 후 따로 해제됩니다.
메모리를 미리 할당하고 한 번에 삭제하는 것입니다.

:::info
[블로그](https://manishearth.github.io/blog/2021/03/15/arenas-in-rust/)에 메모리 구역에 대해 자세히 설명합니다.
:::

[`bumpalo`](https://docs.rs/bumpalo/latest/bumpalo/)는 우리의 사용 사례에 매우 적합한 후보입니다:

> 범프 할당은 빠르지만 할당에 제한적인 접근 방식입니다.
> 우리는 메모리 chunk를 가지고, 메모리 내에 포인터를 유지합니다. 객체를 할당할 때 마다,
> 우리는 chunk에 개체를 할당할 수 있는 충분한 용량이 남아 있는지 빠르게 확인한 다음 개체 크기에 따라 포인터를 업데이트합니다. 그 뿐입니다!
>
> 범프 할당의 단점은 개별 객체의 할당을 해제하거나 더 이상 사용하지 않는 객체의 메모리 영역을 회수할 수 있는 일반적인 방법이 없다는 것입니다.
>
> 이러한 trade off 덕분에 범프 할당은 단계 지향 할당에 적합합니다. 즉, 동일한 프로그램 단계에서 모두 할당되어 사용된 다음 모두 그룹으로 함께 할당 해제할 수 있는 객체 그룹입니다.

`bumpalo::collections::Vec` 및 `bumpalo::boxed::Box`를 사용하면 AST에 lifetime이 추가됩니다:

```rust
use bumpalo::collections::Vec;
use bumpalo::boxed::Box;

pub enum Expression<'a> {
    AwaitExpression(Box<'a, AwaitExpression>),
    YieldExpression(Box<'a, YieldExpression>),
}

pub struct AwaitExpression<'a> {
    pub node: Node,
    pub expression: Expression<'a>,
}

pub struct YieldExpression<'a> {
    pub node: Node,
    pub expression: Expression<'a>,
}
```

:::caution
이 단계에서 lifetime를 다루는 것이 익숙하지 않다면 주의해 주세요.
저희 프로그램은 메모리 영역 없이도 잘 작동합니다.

다음 장의 코드에서는 단순화를 위해 메모리 영역을 사용하지 않습니다.
:::

## JSON Serialization

[serde](https://serde.rs/)를 사용하여 AST를 JSON으로 직렬화할 수 있습니다. `estree`와 호환되도록 하려면 몇 가지 기술이 필요합니다.
다음은 몇 가지 예입니다:

```rust
use serde::Serialize;

#[derive(Debug, Clone, Serialize, PartialEq)]
#[serde(tag = "type")]
#[cfg_attr(feature = "estree", serde(rename = "Identifier"))]
pub struct IdentifierReference {
    #[serde(flatten)]
    pub node: Node,
    pub name: Atom,
}

#[derive(Debug, Clone, Serialize, PartialEq, Hash)]
#[serde(tag = "type")]
#[cfg_attr(feature = "estree", serde(rename = "Identifier"))]
pub struct BindingIdentifier {
    #[serde(flatten)]
    pub node: Node,
    pub name: Atom,
}

#[derive(Debug, Serialize, PartialEq)]
#[serde(untagged)]
pub enum Expression<'a> {
    ...
}
```

- `serde(tag = "type")`는 구조체 이름을 "type" 필드로 만드는 데 사용됩니다(예: `{ "type" : "..." }`).
- `cfg_attr` + `serde(rename)`는 `estree`가 다른 식별자를 구분하지 않기 때문에 다른 구조체 이름을 같은 이름으로 바꾸는 데 사용됩니다.
- 열거형에 `serde(untagged)`는 열거형에 대한 추가 JSON 객체를 생성하지 않는 데 사용됩니다.
