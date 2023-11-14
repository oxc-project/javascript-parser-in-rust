---
id: ast
title: Abstract Syntax Tree
---

The parser in the upcoming chapter is responsible for turning Tokens into an abstract syntax tree (AST).
It is much nicer to work on the AST compared to the source text.

All JavaScript toolings work on the AST level, for example:

- A linter (e.g. eslint) checks the AST for errors
- A formatter (e.g.prettier) prints the AST back to JavaScript text
- A minifier (e.g. terser) transforms the AST
- A bundler connects all import and export statements between ASTs from different files

In this chapter, let's construct a JavaScript AST by using Rust structs and enums.

## Getting familiar with the AST

To get ourselves comfortable with an AST, let's visit [ASTExplorer](https://astexplorer.net/) and see what it looks like.
On the top panel, select JavaScript, and then `acorn`, type in `var a` and we will see a tree view and a JSON view.

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

Since this is a tree, every object is a node with a type name (e.g. `Program`, `VariableDeclaration`, `VariableDeclarator`, `Identifier`).
`start` and `end` are the offsets from the source.

## estree

[estree](https://github.com/estree/estree) is a community standard grammar specification for JavaScript,
it defines [all the AST nodes](https://github.com/estree/estree/blob/master/es5.md) so different tools
can be compatible with each other.

The basic building block for any AST node is the `Node` type:

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

AST for `var a` is defined as

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

Rust does not have inheritance, so `Node` is added to each struct (this is called "composition over Inheritance").

`Statement`s and `Expression`s are enums because they will be expanded with a lot of other node types, for example:

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

The `Box` is needed because self-referential structs are not allowed in Rust.

:::info
JavaScript grammar has a lot of nuisances, read the [grammar tutorial](/blog/grammar) for amusement.
:::

## Rust Optimizations

### Memory Allocations

Back in the [Overview](./overview.md) chapter,
I briefly mentioned that we need to look out for heap-allocated structs such as `Vec` and `Box` because heap allocations are not cheap.

Take a look at the [real world implementation from swc](https://github.com/swc-project/swc/blob/main/crates/swc_ecma_ast/src/expr.rs),
we can see that an AST can have lots of `Box`s and `Vec`s, and also note that the `Statement` and `Expression` enums contain
a dozen of enum variants.

### Enum Size

The first optimization we are going to make is to reduce the size of the enums.

It is known that the byte size of a Rust enum is the union of all its variants.
For example, the following enum will take up 56 bytes (1 byte for the tag, 48 bytes for the payload, and 8 bytes for alignment).

```rust
enum Name {
    Anonymous, // 0 byte payload
    Nickname(String), // 24 byte payload
    FullName{ first: String, last: String }, // 48 byte payload
}
```

:::note
This example is taken from [this blog post](https://adeschamps.github.io/enum-size)
:::

As for the `Expression` and `Statement` enums, they can take up to more than 200 bytes with our current setup.

These 200 bytes need to be passed around, or accessed every time we do a `matches!(expr, Expression::AwaitExpression(_))` check,
which is not very cache friendly for performance.

A better approach would be to box the enum variants and only carry 16 bytes around.

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

To make sure the enums are indeed 16 bytes on 64-bit systems, we can use `std::mem::size_of`.

```rust
#[test]
fn no_bloat_enum_sizes() {
    use std::mem::size_of;
    assert_eq!(size_of::<Statement>(), 16);
    assert_eq!(size_of::<Expression>(), 16);
}
```

"no bloat enum sizes" test cases can often be seen in the Rust compiler source code for ensuring small enum sizes.

```rust reference
https://github.com/rust-lang/rust/blob/9c20b2a8cc7588decb6de25ac6a7912dcef24d65/compiler/rustc_ast/src/ast.rs#L3033-L3042
```

To find other large types, we can run

```bash
RUSTFLAGS=-Zprint-type-sizes cargo +nightly build -p name_of_the_crate --release
```

and see

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

Using the global memory allocator for the AST is actually not really efficient.
Every `Box` and `Vec` are allocated on demand and then dropped separately.
What we would like to do is pre-allocate memory and drop it in wholesale.

:::info
[This blog post](https://manishearth.github.io/blog/2021/03/15/arenas-in-rust/) explains memory arena in more detail.
:::

[`bumpalo`](https://docs.rs/bumpalo/latest/bumpalo/) is a very good candidate for our use case, according to its documentation:

> Bump allocation is a fast, but limited approach to allocation.
> We have a chunk of memory, and we maintain a pointer within that memory. Whenever we allocate an object,
> we do a quick check that we have enough capacity left in our chunk to allocate the object and then update the pointer by the object’s size. That’s it!
>
> The disadvantage of bump allocation is that there is no general way to deallocate individual objects or reclaim the memory region for a no-longer-in-use object.
>
> These trade offs make bump allocation well-suited for phase-oriented allocations. That is, a group of objects that will all be allocated during the same program phase, used, and then can all be deallocated together as a group.

By using `bumpalo::collections::Vec` and `bumpalo::boxed::Box`, our AST will have lifetimes added to it:

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
Please be cautious if we are not comfortable dealing with lifetimes at this stage.
Our program will work fine without a memory arena.

Code in the following chapters does not demonstrate the use of a memory arena for simplicity.
:::

## JSON Serialization

[serde](https://serde.rs/) can be used serialize the AST to JSON. Some techniques are needed to make it `estree` compatible.
Here are some examples:

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

- `serde(tag = "type")` is used to make the struct name a "type" field, i.e. `{ "type" : "..." }`
- `cfg_attr` + `serde(rename)` is used to rename different struct names to the same name, since `estree` does not distinguish different identifiers
- `serde(untagged)` on the enum is used to not create an extra JSON object for the enum
