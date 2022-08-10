---
id: architecture
title: Architecture Overview
---

For our book, we will be applying the standard compiler frontend phases:

Source Text -> Token -> Lexer -> Parser -> AST

Writing a JavaScript parser is actually really easy,
it is 10% architectural decisions and 90% hard work on the fine grained details.

The architectural decisions will affect mostly two categories:

* the performance of your compiler
* how nice it is to consume your AST

## Performance

The key to a performant Rust program is to *make less momory allocations* and *use less cpu cycles*.

It is mostly transparent when a momory allocation is made just by searching heap allocated structs such as `Vec` or `Box`,
so reason about their usage will give you a sense of how fast your program will be.

With zero cost abstraction, we don't need to worry too much about abstractions causing slower performance.
Becareful with your algorithmic complexities and you will be all good to go.
