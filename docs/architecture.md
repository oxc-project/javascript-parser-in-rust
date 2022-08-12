---
id: architecture
title: Architecture Overview
---

For our book, we will be applying the standard compiler frontend phases:

```mermaid
flowchart LR;
    id[Source Text] --> Token --> Lexer --> Parser --> AST
```

Writing a JavaScript parser is fairly easy,
it is 10% architectural decisions and 90% hard work on the fine-grained details.

The architectural decisions will mostly affect two categories:

- the performance of your compiler
- how nice it is to consume your AST

Knowing all the options and trade-offs before building a compiler in Rust will make your whole journey much smoother.

## Performance

The key to a performant Rust program is to **allocate less memory** and **use fewer CPU cycles**.

It is mostly transparent where memory allocations are made just by looking for heap-allocated objects such as a `Vec` or a `Box`.
Reasoning about their usage will give you a sense of how fast your program will be - the more you allocate, you slower your program will be.

Rust gives us zero-cost abstraction for free, we don't need to worry too much about abstractions causing slower performance.
Be careful with your algorithmic complexities and you will be all good to go.

If you are unsure about the performance of an API,
don't be afraid to click the "source" button on the Rust documentation and read the source code,
the source code is easy to understand most of the time.
