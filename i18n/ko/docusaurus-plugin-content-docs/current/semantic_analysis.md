---
id: semantics_analysis
title: Semantic Analysis
---

시맨틱 분석은 소스 코드가 올바른지 여부를 확인하는 프로세스입니다.
ECMAScript 사양의 모든 "Early Error" 규칙에 대해 확인해야 합니다.

## Context

예를 들어 `[Yield]` 또는 `[Await]`와 같은 문법 문맥의 경우 문법이 금지하는 경우 오류를 발생시켜야 합니다:

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

에러를 보일 필요가 있습니다

```javascript
async *
  function foo() {
    var yield, await;
  };
```

왜냐하면 `AsyncGeneratorDeclaration`에는 `[+Yield]`와 `AsyncGeneratorBody`에 대한 `[+Await]`가 있기 때문입니다:

```markup
AsyncGeneratorBody :
  FunctionBody[+Yield, +Await]
```

Rome에서 `yield` 키워드를 확인하는 예제입니다:

```rust reference
https://github.com/rome/tools/blob/5a059c0413baf1d54436ac0c149a829f0dfd1f4d/crates/rome_js_parser/src/syntax/expr.rs#L1368-L1377
```

## Scope

선언 오류의 경우:

```markup
14.2.1 Static Semantics: Early Errors

Block : { StatementList }
* It is a Syntax Error if the LexicallyDeclaredNames of StatementList contains any duplicate entries.
* It is a Syntax Error if any element of the LexicallyDeclaredNames of StatementList also occurs in the VarDeclaredNames of StatementList.
```

스코프 트리를 추가해야 합니다. 스코프 트리는 그 안에 선언된 모든 `var`와 `let`을 포함합니다.
또한 트리를 탐색하고 상위 스코프에서 바인딩 식별자를 검색하려는 상위 포인팅 트리이기도 합니다.
우리가 사용할 수 있는 데이터 구조는 [`indextree`](https://docs.rs/indextree/latest/indextree/)입니다.

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

스코프 트리는 성능상의 이유로 파서 내부에 구축하거나 별도의 AST 패스에 구축할 수 있습니다.

일반적으로 `ScopeBuilder`가 필요합니다:

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

그런 다음, 예를 들어 acorn에서와 같이 파싱 함수 내에서 `enter_scope`와 `leave_scope`를 적절히 호출합니다:

```javascript reference
https://github.com/acornjs/acorn/blob/11735729c4ebe590e406f952059813f250a4cbd1/acorn/src/statement.js#L425-L437
```

:::info
이 접근 방식의 단점 중 하나는 화살표 함수의 경우,
화살표 함수가 아니라 시퀀스 표현식인 경우 임시 범위를 생성한 다음 나중에 삭제해야 할 수 있습니다.
이에 대한 자세한 내용은 [cover grammar](/blog/grammar#cover-grammar)에서 확인할 수 있습니다.
:::

### The Visitor Pattern

간소화를 위해 다른 패스에서 스코프 트리를 빌드하기로 결정한 경우, AST의 모든 노드를 깊이 우선 선순위로 방문하고 스코프 트리를 빌드해야 합니다.

[Visitor Pattern](https://rust-unofficial.github.io/patterns/patterns/behavioural/visitor.html)을 사용하여 각 객체에서 수행되는 작업에서 traversal process를 분리할 수 있습니다.

방문 시 `enter_scope`와 `leave_scope`를 적절히 호출하여 스코프 트리를 구축할 수 있습니다.