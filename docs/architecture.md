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

## Performance

The key to a performant Rust program is to **make less memory allocations** and **use fewer CPU cycles**.

It is mostly transparent when a memory allocation is made just by looking for heap-allocated structs such as `Vec` or `Box`.
Reasoning about their usage will give you a sense of how fast your program will be.

With zero-cost abstraction, we don't need to worry too much about abstractions causing slower performance.
Be careful with your algorithmic complexities and you will be all good to go.
