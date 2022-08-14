---
id: parser
title: Parser
---

The parser we are going to construct is called a recursive descent parser,
it is a manual process of going down the grammar and building up the AST.

The parser starts simple, it holds the source code, the lexer, and the current token consumed from the lexer.

```rust
pub struct Parser<'a> {
    /// Source Code
    source: &'a str,

    lexer: Lexer<'a>,

    /// Current Token consumed from the lexer
    cur_token: Token,

    /// The end range of the previous token
    prev_node_end: usize,
}

impl<'a> Parser<'a> {
    pub fn new(source: &'a str) -> Self {
        Self {
            source,
            lexer: Lexer::new(source),
            cur_token: Token::default(),
        }
    }

    pub fn parse(&mut self) -> Program<'a> {
        Ok(Program {
            node: Node {
                start: 0,
                end: self.source.len(),
            }
            body: vec![]
        })
    }
}
```

## Helper functions

The current token `cur_token: Token` holds the current token returned from the lexer.
We'll make the parser code cleaner by adding some helper functions for navigating and inspecting this token.

```rust
impl<'a> Parser<'a> {
    fn start_node(&self) -> Node {
        let token = self.cur_token();
        Node::new(token.start, 0)
    }

    fn finish_node(&self, node: Node) -> Node {
        Node::new(node.start, self.prev_node_end)
    }

    fn cur_token(&self) -> &Token {
        &self.cur_token
    }

    fn cur_kind(&self) -> Kind {
        self.cur_token.kind
    }

    /// Checks if the current index has token `Kind`
    fn at(&self, kind: Kind) -> bool {
        self.cur_kind() == kind
    }

    /// Advance and return true if we are at `Kind`
    fn bump(&mut self, kind: Kind) {
        if self.at(kind) {
            self.advance();
        }
    }

    /// Advance any token
    fn bump_any(&mut self) {
        self.advance();
    }

    /// Advance and return true if we are at `Kind`, return false otherwise
    fn eat(&mut self, kind: Kind) -> bool {
        if self.at(kind) {
            self.advance();
            return true;
        }
        false
    }

    /// Move to the next token
    fn advance(&mut self) {
        let token = self.lexer.next_token();
        self.prev_node_end = self.cur_token.end;
        self.cur_token = token;
    }
}
```

## Parse Functions

The `DebuggerStatement` is the most simple statement to parse, so let's try and parse it and return a valid program

```rust
impl<'a> Parser<'a> {
    pub fn parse(&mut self) -> Program {
        let stmt = self.parse_debugger_statement();
        let body = vec![stmt];
        Ok(Program {
            node: Node {
                start: 0,
                end: self.source.len(),
            }
            body,
        })
    }

    fn parse_debugger_statement(&mut self) -> Statement {
        let node = self.start_node();
        self.bump_any();
        Statement::DebuggerStatement {
            node: self.finish_node(node),
        }
    }
}
```

All the other parse functions build on these primitive helper functions,
for example parsing the `while` statement in swc:

```rust reference
https://github.com/swc-project/swc/blob/554b459e26b24202f66c3c58a110b3f26bbd13cd/crates/swc_ecma_parser/src/parser/stmt.rs#L952-L970
```

## Dealing with errors

Quoting from the [Dragon Book](https://www.amazon.com/Compilers-Principles-Techniques-Tools-2nd/dp/0321486811)

> Most programming language specifications do not describe how a compiler should respond to errors; error handling is left to the compiler designer.
> Planning the error handling right from the start can both simplify the structure of a compiler and improve its handling of errors.

A fully recoverable parser can construct an AST no matter what we throw at it.
For tools such as linter or formatter, one would wish for a fully recoverable parser so we can act on part of the program.

A panicking parser will abort if there is any grammar mismatch, and a partially recoverable parser will recover from deterministic grammars.

For example, given a grammatically incorrect while statement `while true {}`, we know it is missing round brackets,
and the only punctuation it can have are round brackets, so we can still return a valid AST and indicate its missing brackets.

Most JavaScript parsers out there are partially recoverable, so we'll do the same and build a partially recoverable parser.

:::info
The [Rome](https://github.com/rome/tools) parser is a fully recoverable parser.
:::

## Parsing Expressions

### Recursive Descent

### Pratt Parsing

## Rust Optimizations
