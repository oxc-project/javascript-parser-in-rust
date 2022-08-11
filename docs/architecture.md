---
id: architecture
title: Architecture Overview
---

For our book, we will be applying the standard compiler frontend phases:

Source Text -> Token -> Lexer -> Parser -> AST

Writing a JavaScript parser is actually really easy,
it is 10% architectural decisions and 90% hard work on the fine-grained details.

The architectural decisions will mostly affect two categories:

- the performance of your compiler
- how nice it is to consume your AST

## Performance

The key to a performant Rust program is to _make less momory allocations_ and _use less cpu cycles_.

It is mostly transparent when a momory allocation is made just by looking for heap allocated structs such as `Vec` or `Box`.
Reasoning about their usage will give you a sense of how fast your program will be.

With zero cost abstraction, we don't need to worry too much about abstractions causing slower performance.
Becareful with your algorithmic complexities and you will be all good to go.
