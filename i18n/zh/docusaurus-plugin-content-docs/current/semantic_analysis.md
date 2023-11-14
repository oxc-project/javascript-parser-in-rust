---
id: semantics_analysis
title: 语义分析 (Semantic Analysis)
---

语义分析是检查我们的源代码是否正确的过程。
我们需要根据ECMAScript规范中的所有"早期错误"规则进行检查。

## 上下文

对于语法上下文，如`[Yield]`或`[Await]`，若语法禁止它们出现，需要引发错误，例如：

```markup
BindingIdentifier[Yield, Await] :
  Identifier
  yield
  await

13.1.1 静态语义：早期错误

BindingIdentifier[Yield, Await] : yield
* 如果此产生式具有[Yield]参数，则为语法错误。

* BindingIdentifier[Yield, Await] : await
如果此产生式具有[Await]参数，则为语法错误。
```

需要对以下代码引发错误：

```javascript
async *
  function foo() {
    var yield, await;
  };
```

因为`AsyncGeneratorDeclaration`对于`AsyncGeneratorBody`带有`[+Yield]`和`[+Await]`：

```markup
AsyncGeneratorBody :
  FunctionBody[+Yield, +Await]
```

在Rome中检查`yield`关键字的示例：

```rust reference
https://github.com/rome/tools/blob/5a059c0413baf1d54436ac0c149a829f0dfd1f4d/crates/rome_js_parser/src/syntax/expr.rs#L1368-L1377
```

## 作用域

对于声明错误 (declaration errors)：

```markup
14.2.1 静态语义：早期错误

Block : { StatementList }
* 如果StatementList的LexicallyDeclaredNames包含任何重复条目，则为语法错误。
* 如果StatementList的LexicallyDeclaredNames中的任何元素也出现在StatementList的VarDeclaredNames中，则为语法错误。
```

我们需要添加一个作用域树 (scope tree)。作用域树包含在其中声明的所有`var`和`let`。
这棵树的节点有指向父级节点的指针，我们希望以此在树上向上移动并在父级作用域之中搜索绑定标识符。
我们可以使用[`indextree`](https://docs.rs/indextree/latest/indextree/)作为数据结构。

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

我们可以在解析器内部构建作用域树以追求性能，也可以在一次单独的AST遍历中构建。

通常情况下，需要一个`ScopeBuilder`：

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
        // 继承一下函数的严格模式
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

然后在解析函数中相应地调用`enter_scope`和`leave_scope`，例如在acorn中：

```javascript reference
https://github.com/acornjs/acorn/blob/11735729c4ebe590e406f952059813f250a4cbd1/acorn/src/statement.js#L425-L437
```

:::info
这种方法的一个缺点是，对于箭头函数，我们可能需要创建一个临时作用域，若是在不是箭头函数而是序列表达式 (sequence expression)时则将其 drop。
这在[cover grammar](/blog/grammar#cover-grammar)中有详细说明。
:::

### 访问者模式 (The Visitor Pattern)

如果我们选择在一个单独的遍历中构建作用域树以追求简单，
那么需要按照深度优先的前序 (preorder)来访问AST中的每个节点并构建作用域树。

我们可以使用[访问者模式](https://rust-unofficial.github.io/patterns/patterns/behavioural/visitor.html)将遍历过程与对每个对象执行的操作分离开来。

在访问时，我们可以相应地调用`enter_scope`和`leave_scope`来构建作用域树。
