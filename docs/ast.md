---
id: ast
title: Abstract Syntax Tree
---

The parser in the following chapter is responsible for turning Tokens into an abstract syntax tree (AST).
It is much nicer to work on the AST compared to the original source text.

All JavaScript toolings work on the AST level, for example:

- A linter (e.g. eslint) checks the ast for errors
- A formatter (e.g.prettier) prints the ast back to JavaScript text
- A minifier (e.g. terser) transforms the ast
- A bundler connects all import and export statements between asts from different files

In this chapter we will make a high dive so we can have some ASTs to use.

## Getting familiar with the AST

To get ourselves comfortable with an AST, let's visit [ASTExplorer](https://astexplorer.net/) and see what it looks like.
On the top panel, select JavaScript, and then `acorn`, type in `var a` and we will see a tree view and a json view.

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

There exists a widely used specification called [estree](https://github.com/estree/estree),
it defines [all the AST nodes](https://github.com/estree/estree/blob/master/es5.md) for JavaScript.

Let's start with the basic building blocks and define the AST nodes in Rust.

```rust
#[derive(Debug, Default, Clone, Copy, Serialize, PartialEq, Eq)]
pub struct Node {
    pub start: usize,
    pub end: usize,
}

impl Node {
    #[must_use]
    pub fn new(start: usize, end: usize) -> Self {
        Self { start, end }
    }
}
```

Rust doesn't have inheritance, so we'll just keep it simple and use composition instead.
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

::: info
JavaScript grammar has a lot of annoyances, you can read the [grammar tutorial](/blog/grammar) for amusement.
:::

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

The `Box` is needed because self referential structs are not allowed in Rust.

## Rust Optimizations

### Memory allocations

Back in the [Architecture Overview](/docs/architecture) chapter,
I briefly mentioned that you need to look out for heap allocated structs such as `Vec` and `Box` because heap allocations are not cheap.

Take a look at the [real word implementation from swc](https://github.com/swc-project/swc/blob/main/crates/swc_ecma_ast/src/expr.rs),
we can see that an AST can have lots `Box`s and `Vec`s, and also note that the `Statement` and `Expression` enums contain
a dozen of enum variants.

### Enum Size

The first optimization we are going to make is to reduce the size of the enums.

It is known that the byte size of a Rust enum is the union of all its variants.
For example the following enum will take up 56 bytes (1 byte for the tag, 48 bytes for the payload and 8 bytes for alignment padding)

```rust
enum Name {
    Anonymous, // 0 byte payload
    Nickname(String), // 24 byte payload
    FullName{ first: String, last: String }, // 48 byte payload
}
```

:::note
The above example is taken from [this blog post](https://adeschamps.github.io/enum-size)
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

:::info
To make sure the enums are indeed 16 bytes, you can use `std::mem::size_of`.
You will often see "no bloat enum sizes" test cases in the Rust Compiler source code for ensuring small enum sizes.

```rust
#[test]
fn no_bloat_enum_sizes() {
    use std::mem::size_of;
    assert_eq!(size_of::<Statement>(), 16);
    assert_eq!(size_of::<Expression>(), 16);
}
```

:::

#### Memory Arena

Using the global memory allocator for the AST is actually not really efficient.
Every `Box` and `Vec` are allocated on demand, and then dropped separately.
What we would like to do is pre-allocate memory and drop in wholesale.

:::info
You can read more on this topic in [this blog post](https://manishearth.github.io/blog/2021/03/15/arenas-in-rust/)
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
Please be cautious if you are not comfortable of dealing with lifetimes at this stage.
Your program will work fine without a memory arena.
:::
