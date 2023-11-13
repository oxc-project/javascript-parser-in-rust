---
id: ast
title: 抽象语法树 (Abstract Syntax Tree)
---

在接下来的章节中，解析器负责将标记转换为抽象语法树（AST）。与源文本相比，使用AST来工作更加方便。

所有的JavaScript工具都在AST级别上工作，例如：

- 一个代码检查工具（如eslint）检查AST中的错误
- 一个代码格式化工具（如prettier）将AST打印回JavaScript文本
- 一个代码压缩工具（如terser）转换AST
- 一个打包工具连接不同文件的AST中的导入和导出语句

在本章中，我们将使用Rust的结构体和枚举来构建一个JavaScript的AST。

## 熟悉AST

为了让我们对AST感到舒适，让我们访问[ASTExplorer](https://astexplorer.net/)并看看它是什么样子的。
在顶部面板上，选择JavaScript，然后选择`acorn`，输入`var a`，我们将看到一个树形视图和一个JSON视图。

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

由于这是一棵树，每个对象都是一个节点，具有类型名称（例如`Program`，`VariableDeclaration`，`VariableDeclarator`，`Identifier`）。
`start`和`end`是相对于源文本的偏移量。

## estree

[estree](https://github.com/estree/estree)是JavaScript的一个社区标准语法规范，
它定义了[所有的AST节点](https://github.com/estree/estree/blob/master/es5.md)，以便不同的工具
可以相互兼容。

任何AST节点的基本构建块是`Node`类型：

```rust
#[derive(Debug, Default, Clone, Copy, Serialize, PartialEq, Eq)]
pub struct Node {
    /// 在源代码中的起始偏移量
    pub start: usize,

    /// 在源代码中的结束偏移量
    pub end: usize,
}

impl Node {
    pub fn new(start: usize, end: usize) -> Self {
        Self { start, end }
    }
}
```

`var a`的AST定义如下：

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

Rust没有继承，因此在每个结构体中添加了`Node`（这称为“组合而非继承”）。

`Statement`和`Expression`是枚举类型，因为它们将会扩展为许多其他节点类型，例如：

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

需要使用`Box`，因为在Rust中不允许自引用结构体。

:::info
JavaScript语法有很多细微之处，请阅读[语法教程](/blog/grammar)以获得乐趣。
:::

## Rust优化

### 内存分配

在[概述](./overview)章节中提到，我们需要注意堆分配的结构体，如`Vec`和`Box`，因为堆分配并不廉价。

看一下[swc项目的真实实现](https://github.com/swc-project/swc/blob/main/crates/swc_ecma_ast/src/expr.rs)，我们可以看到AST可能有很多`Box`和`Vec`，还要注意`Statement`和`Expression`枚举包含很多枚举变体。

### 枚举大小

我们将要做的第一个优化是减小枚举的大小。

众所周知，Rust枚举的字节大小是其所有变体的总和。例如，以下枚举将占用56字节（1字节用于标签，48字节用于有效载荷，8字节用于对齐）。

```rust
enum Name {
    Anonymous, // 0字节有效载荷
    Nickname(String), // 24字节有效载荷
    FullName{ first: String, last: String }, // 48字节有效载荷
}
```

:::note
此示例摘自[此博文](https://adeschamps.github.io/enum-size)
:::

至于`Expression`和`Statement`枚举，它们在当前设置下可能占用超过200字节。

这200字节需要传递或在每次进行`matches!(expr, Expression::AwaitExpression(_))`检查时访问，这对性能来说并不是很友好。

更好的方法是将枚举变体装箱，并且只携带16字节。

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

为了确保在64位系统上枚举确实是16字节，我们可以使用`std::mem::size_of`。

```rust
#[test]
fn no_bloat_enum_sizes() {
    use std::mem::size_of;
    assert_eq!(size_of::<Statement>(), 16);
    assert_eq!(size_of::<Expression>(), 16);
}
```

“无膨胀的枚举大小”测试用例经常出现在Rust编译器源代码中，用于确保枚举大小合理。

```rust reference
https://github.com/rust-lang/rust/blob/9c20b2a8cc7588decb6de25ac6a7912dcef24d65/compiler/rustc_ast/src/ast.rs#L3033-L3042
```

要找到其他大型类型，我们可以运行

```bash
RUSTFLAGS=-Zprint-type-sizes cargo +nightly build -p name_of_the_crate --release
```

然后查看

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

#### 内存区域

对于 AST 使用全局内存分配器实际上并不是非常高效的。
每个 `Box` 和 `Vec` 都是按需分配然后单独丢弃的。
我们希望做的是预先分配内存然后一次性丢弃它。

:::info
[这篇博客文章](https://manishearth.github.io/blog/2021/03/15/arenas-in-rust/) 更详细地解释了内存区域。
:::

根据其文档，[`bumpalo`](https://docs.rs/bumpalo/latest/bumpalo/) 是我们使用的一个非常好的选择：

> Bump 分配是一种快速但有限的分配方法。
> 我们有一块内存，然后在该内存中维护一个指针。每当我们分配一个对象时，
> 我们快速检查一下我们的块中是否还有足够的容量来分配该对象，然后通过对象的大小更新指针。就是这样！
>
> Bump 分配的缺点是没有一般方法来释放单个对象或为不再使用的对象回收内存区域。
>
> 这些权衡使得 Bump 分配非常适合阶段性分配。也就是说，在同一程序阶段将分配一组对象，然后可以一起作为一组进行释放。

通过使用 `bumpalo::collections::Vec` 和 `bumpalo::boxed::Box`，我们的 AST 将添加生命周期：

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
如果我们在这个阶段不熟悉处理生命周期，请谨慎。
我们的程序在没有内存区域的情况下也可以正常工作。

在接下来的章节中的代码示例中，为了简单起见，并未展示使用内存区域的情况。
:::

## JSON 序列化

[serde](https://serde.rs/) 可以用于将 AST 序列化为 JSON。需要一些技巧使其与 `estree` 兼容。
以下是一些示例：

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

- `serde(tag = "type")` 用于将结构体名称作为 "type" 字段，即 `{ "type": "..." }`
- `cfg_attr` + `serde(rename)` 用于将不同的结构体名称重命名为相同的名称，因为 `estree` 不区分不同的标识符
- 枚举类型上的 `serde(untagged)` 用于不为枚举类型创建额外的 JSON 对象
