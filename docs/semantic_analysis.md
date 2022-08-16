---
id: semantics_analysis
title: Semantic Analysis
---

Semantic analysis is the process of checking whether our source code is correct or not.
We need to check against all the "Early Error" rules in the ECMAScript specification.

## Context

For grammar contexts such as [Yield] or [Await], an error need to be raised when the grammar forbids them, for example:

```markup
BindingIdentifier[Yield, Await] :
  Identifier
  yield
  await

13.1.1 Static Semantics: Early Errors

BindingIdentifier[Yield, Await] : yield
* It is a Syntax Error if this production has a [Yield] parameter.

* BindingIdentifier[Yield, Await] : await
It is a Syntax Error if this production has an [Await] parameter.
```

need to raise an error for

```javascript
async *
  function foo() {
    var yield, await;
  };
```

because `AsyncGeneratorDeclaration` has `[+Yield]` and `[+Await]` for `AsyncGeneratorBody`:

```markup
AsyncGeneratorBody :
  FunctionBody[+Yield, +Await]
```

An example in Rome checking for the `yield` keyword:

```rust reference
https://github.com/rome/tools/blob/5a059c0413baf1d54436ac0c149a829f0dfd1f4d/crates/rome_js_parser/src/syntax/expr.rs#L1368-L1377
```

## Scope

For declaration errors:

```markup
14.2.1 Static Semantics: Early Errors

Block : { StatementList }
* It is a Syntax Error if the LexicallyDeclaredNames of StatementList contains any duplicate entries.
* It is a Syntax Error if any element of the LexicallyDeclaredNames of StatementList also occurs in the VarDeclaredNames of StatementList.
```

We need to add a scope tree. A scope tree has all the `var`s and `let`s declared inside it.
It is also a parent pointing tree where we want to navigate up the tree and search for binding identifiers in parent scopes.
The data structure we can use is [`indextree`](https://docs.rs/indextree/latest/indextree/).

```rust
use indextree::{Arena, Node, NodeId};
use bitflags::bitflags;

pub type Scopes = Arena<Scope>;
pub type ScopeId = NodeId;

bitflags! {
    #[derive(Default)]
    pub struct ScopeFlags: u8 {
        const TOP = 1 << 0;
        const FUNCTION = 1 << 1;
        const ARROW = 1 << 2;
        const CLASS_STATIC_BLOCK = 1 << 4;
        const VAR = Self::TOP.bits | Self::FUNCTION.bits | Self::CLASS_STATIC_BLOCK.bits;
    }
}

#[derive(Debug, Clone)]
pub struct Scope {
    /// [Strict Mode Code](https://tc39.es/ecma262/#sec-strict-mode-code)
    /// [Use Strict Directive Prologue](https://tc39.es/ecma262/#sec-directive-prologues-and-the-use-strict-directive)
    pub strict_mode: bool,

    pub flags: ScopeFlags,

    /// [Lexically Declared Names](https://tc39.es/ecma262/#sec-static-semantics-lexicallydeclarednames)
    pub lexical: IndexMap<Atom, SymbolId, FxBuildHasher>,

    /// [Var Declared Names](https://tc39.es/ecma262/#sec-static-semantics-vardeclarednames)
    pub var: IndexMap<Atom, SymbolId, FxBuildHasher>,

    /// Function Declarations
    pub function: IndexMap<Atom, SymbolId, FxBuildHasher>,
}
```

The scope tree can either be built inside the parser for performance reasons, or built in a separate AST pass.

Generally, a `ScopeBuilder` is needed:

```rust
pub struct ScopeBuilder {
    scopes: Scopes,
    root_scope_id: ScopeId,
    current_scope_id: ScopeId,
}

impl ScopeBuilder {
    pub fn current_scope(&self) -> &Scope {
        self.scopes[self.current_scope_id].get()
    }

    pub fn enter_scope(&mut self, flags: ScopeFlags) {
        // Inherit strict mode for functions
        // https://tc39.es/ecma262/#sec-strict-mode-code
        let mut strict_mode = self.scopes[self.root_scope_id].get().strict_mode;
        let parent_scope = self.current_scope();
        if !strict_mode
            && parent_scope.flags.intersects(ScopeFlags::FUNCTION)
            && parent_scope.strict_mode
        {
            strict_mode = true;
        }

        let scope = Scope::new(flags, strict_mode);
        let new_scope_id = self.scopes.new_node(scope);
        self.current_scope_id.append(new_scope_id, &mut self.scopes);
        self.current_scope_id = new_scope_id;
    }

    pub fn leave_scope(&mut self) {
      self.current_scope_id = self.scopes[self.current_scope_id].parent().unwrap();
    }
}
```

We then call `enter_scope` and `leave_scope` accordingly inside the parse functions, for example in acorn:

```javascript reference
https://github.com/acornjs/acorn/blob/11735729c4ebe590e406f952059813f250a4cbd1/acorn/src/statement.js#L425-L437
```

:::info
One of the downsides of this approach is that for arrow functions,
we may need to create a temporary scope and then drop it afterwards if it is not an arrow function but a sequence expression.
This is detailed in [cover grammar](/blog/grammar#cover-grammar).
:::

### The Visitor Pattern

If we decide to build the scope tree in another pass for simplicity,
then every node in the AST need to be visited in depth-first preorder and build the scope tree.

We can use the [Visitor Pattern](https://rust-unofficial.github.io/patterns/patterns/behavioural/visitor.html)
to separate the traversal process from the operations performed on each object.

Upon visit, we can call `enter_scope` and `leave_scope` accordingly to build the scope tree.

## Control Flow Graph (TODO)

For checking unreachable code and various rules ...
