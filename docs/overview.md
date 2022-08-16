---
id: overview
title: Overview
---

For our book, we will be applying the standard compiler frontend phases:

```mermaid
flowchart LR;
    id[Source Text] --> Token --> Lexer --> Parser --> AST
```

Writing a JavaScript parser is fairly easy,
it is 10% architectural decisions and 90% hard work on the fine-grained details.

The architectural decisions will mostly affect two categories:

- the performance of our compiler
- how nice it is to consume our AST

Knowing all the options and trade-offs before building a compiler in Rust will make our whole journey much smoother.

## Performance

The key to a performant Rust program is to **allocate less memory** and **use fewer CPU cycles**.

It is mostly transparent where memory allocations are made just by looking for heap-allocated objects such as a `Vec`, `Box` or `String`.
Reasoning about their usage will give us a sense of how fast our program will be - the more we allocate, the slower our program will be.

Rust gives us the power of zero-cost, we don't need to worry too much about abstractions causing slower performance.
Be careful with our algorithmic complexities and we will be all good to go.

## Rust Source Code

Whenever the performance of an API cannot be deduced,
do not be afraid to click the "source" button on the Rust documentation and read the source code,
they are easy to understand most of the time.

:::info
When navigating the Rust source code, searching for a definition is simply looking for
`fn function_name`, `struct struct_name`, `enum enum_name` etc.
This is one advantage of having constant grammar in Rust (compared to JavaScript 😉).
:::
