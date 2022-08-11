---
title: Grammar
---

## LL(1) Grammar

According to wikipedia,

> an LL grammar is a context-free grammar that can be parsed by an LL parser, which parses the input from Left to right

The first **L** means the scanning the source from **L**eft to right,
and the second **L** means the construction of a **L**eftmost derivation tree.

Context-free and the (1) in LL(1) means a tree can be constructed by just peeking at the next token and nothing else.

LL Grammars are of particular interest in academia because we are lazy human beings and we want to write programs that generate parsers automatically so we don't need to write parsers by hand.

Unfortunately most industrial programming languages do not have a nice LL(1) grammar,
and this applies to JavaScript too.

:::info
Mozilla started the [jsparagus](https://github.com/mozilla-spidermonkey/jsparagus) project a few years ago,
and wrote a [LALR parser generator in Python](https://github.com/mozilla-spidermonkey/jsparagus/tree/master/jsparagus).
They haven't updated it much in the past two years and they sent a strong message at the end of [js-quirks.md](https://github.com/mozilla-spidermonkey/jsparagus/blob/master/js-quirks.md)

> What have we learned today?
>
> - Do not write a JS parser.
> - JavaScript has some syntactic horrors in it. But hey, you don't make the world's most widely used programming language by avoiding all mistakes. You do it by shipping a serviceable tool, in the right circumstances, for the right users.

:::

---

What we have learned so far is that a JavaScript parser can only be written by hand,
so let's learn all the quirks in the grammar before we shoot ourselves in the foot.

The list below starts simple and will become difficult to grasp,
so please take your time.

## Class and strict mode

class is strict, but there is not scope ...

## Legacy Octal and Use Strict

```javascript
"\01";
"use strict";
```

is syntax error

## ES2016 non-simple parameter argument and strict mode

```javascript
function foo({a}) {
    'use strict';
}
```

is syntax error

but ... if you are writing a transpiler, e.g. TypeScript, this is not syntax if you are targeting es5.

## FunctionDeclarations in IfStatement Statement Clauses

[B.3.3 FunctionDeclarations in IfStatement Statement Clauses](https://tc39.es/ecma262/#sec-functiondeclarations-in-ifstatement-statement-clauses)

we need FunctionDeclarations in Statement ...

### Label statement is legit

```
const foo => { foo: bar }
```

is legit

## `let` is not a keyword

you need about a dozen checks to make sure you are on a let declaration ...

## For-of

`for (let in ...)`
`for (async of ..)`

### B.3.2 Block-Level Function Declarations Web Legacy Compatibility Semantics

[B.3.2 Block-Level Function Declarations Web Legacy Compatibility Semantics](https://tc39.es/ecma262/#sec-block-level-function-declarations-web-legacy-compatibility-semantics)

## Ambiguous Grammar

`/` slash and `/=` regex

## Grammar Context

yield ... await ...

## Cover Grammar

### Arrow functions

### Object Patter vs Object binding

### Assignment target pattern
