---
title: The ECMAScript Specification
---

[The ECMAScript® 2023 Language Specification](https://tc39.es/ecma262/) details everything about the JavaScript language, so anyone can implement their own JavaScript engine.

<!--truncate-->

The following chapters need to be studied for our parser:

- Chapter 5: Notational Conventions
- Chapter 11: ECMAScript Language: Source Text
- Chapter 12: ECMAScript Language: Lexical Grammar
- Chapter 13 - 16: Expressions, Statements, Functions, Classes, Scripts and Modules
- Annex B: Additional ECMAScript Features for Web Browsers
- Annex C: The Strict Mode of ECMAScript

For navigation inside the specification:

- Anything clickable has a permanent link, they are shown on the URL as anchors, for example `#sec-identifiers`
- Hovering over things may show a tooltip, clicking on `References` shows all its references

## Notational Conventions

[Chapter 5.1.5 Grammar Notation](https://tc39.es/ecma262/#sec-grammar-notation) is the section we need to read.

The things to note here are:

### Recursion

This is how lists are presented in the grammar.

```markup
ArgumentList :
  AssignmentExpression
  ArgumentList , AssignmentExpression
```

means

```javascript
a, b = 1, c = 2
^_____________^ ArgumentList
   ^__________^ ArgumentList, AssignmentExpression,
          ^___^ AssignmentExpression
```

### Optional

The `_opt_` suffix for optional syntax. For example,

```markup
VariableDeclaration :
  BindingIdentifier Initializer_opt
```

means

```javascript
var binding_identifier;
var binding_identifier = Initializer;
                       ______________ Initializer_opt
```

### Parameters

The `[Return]` and `[In]` are parameters of the grammar.

For example

```markdup
ScriptBody :
    StatementList[~Yield, ~Await, ~Return]
```

means top-level yield, await and return are not allowed in scripts, but

```markdup
ModuleItem :
  ImportDeclaration
  ExportDeclaration
  StatementListItem[~Yield, +Await, ~Return]
```

allows for top-level await.

## Source Text

[Chapter 11.2 Types of Source Code](https://tc39.es/ecma262/#sec-types-of-source-code) tells us that
there is a huge distinction between script code and module code.
And there is a `use strict` mode that makes the grammar saner by disallowing old JavaScript behaviors.

**Script Code** is not strict, `use strict` need to be inserted at the top of the file to make script code strict.
In html we write `<script src="javascript.js"></script>`.

**Module Code** is automatically strict.
In html we write `<script type="module" src="main.mjs"></script>`.

## ECMAScript Language: Lexical Grammar

For more in-depth explanation, read the V8 blog on [Understanding the ECMAScript spec](https://v8.dev/blog/understanding-ecmascript-part-3).

### [Automatic Semicolon Insertion](https://tc39.es/ecma262/#sec-automatic-semicolon-insertion)

This section describes all the rules where we can omit a semicolon while writing JavaScript.
All the explanation boils down to

```rust
    pub fn asi(&mut self) -> Result<()> {
        if self.eat(Kind::Semicolon) || self.can_insert_semicolon() {
            return Ok(());
        }
        let range = self.prev_node_end..self.cur_token().start;
        Err(SyntaxError::AutoSemicolonInsertion(range.into()))
    }

    pub const fn can_insert_semicolon(&self) -> bool {
        self.cur_token().is_on_new_line || matches!(self.cur_kind(), Kind::RCurly | Kind::Eof)
    }
```

The `asi` function need to be manually called where applicable, for example in the end of statement:

```rust
    fn parse_debugger_statement(&mut self) -> Result<Statement<'a>> {
        let node = self.start_node();
        self.expect(Kind::Debugger)?;
        // highlight-next-line
        self.asi()?;
        self.ast.debugger_statement(self.finish_node(node))
    }
```

:::info

This section on asi is written with a parser in mind,
it explicitly states that the source text is parsed from left to right,
which makes it almost impossible to write the parser in any other way.
The author of jsparagus made a rant about this [here](https://github.com/mozilla-spidermonkey/jsparagus/blob/master/js-quirks.md#automatic-semicolon-insertion-).

> The specification for this feature is both very-high-level and weirdly procedural (“When, as the source text is parsed from left to right, a token is encountered...”, as if the specification is telling a story about a browser. As far as I know, this is the only place in the spec where anything is assumed or implied about the internal implementation details of parsing.) But it would be hard to specify ASI any other way.

:::

## Expressions, Statements, Functions, Classes, Scripts and Modules

It takes a while to understand the syntactic grammar, then apply them to writing a parser.
More in-depth content can be found in [the grammar tutorial](./grammar.md).

## Annex B
