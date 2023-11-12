---
id: overview
title: 总览
---

对于本指南，将应用标准编译器前端阶段：

```markup
Source Text --> Lexer --> Token --> Parser --> AST
```

编写 JavaScript 解析器相当容易 。
10% 的工作是架构决策，90% 的工作是细粒度的细节。

架构决策主要会影响两方面：

- 解析器的性能
- 使用我们的 AST 时的舒适度

在用 Rust 构建解析器之前，了解所有选项和权衡将使我们的整个旅程更加顺利。

## 性能

Rust 程序性能的关键在于**分配更少的内存**和**使用更少的 CPU 周期**。

只需查找堆分配的对象（如 `Vec`、`Box` 或 `String`），内存分配大多是透明的。
通过推理这些对象的使用情况，我们就能了解程序的运行速度--分配的越多，速度就越慢。

Rust 为我们提供了零成本抽象的能力，我们不必过于担心抽象会导致性能下降。
只要注意算法的复杂性，我们就能一切顺利。

:::info
你也应该读 [The Rust Performance Book](https://nnethercote.github.io/perf-book/introduction.html).
:::

## Rust 源代码

每当无法推断函数调用的性能时、
不要害怕，点击 Rust 文档中的 "源代码 "按钮，阅读源代码、
大多数情况下，它们都很容易理解。

:::info
当浏览 Rust 源代码时，搜索定义只需查找
`fn function_name`、`struct struct_name`、`enum enum_name`等。
这是 Rust 中使用常量语法的一个优势（与 JavaScript 😉 相比）。
:::
