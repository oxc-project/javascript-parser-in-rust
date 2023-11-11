---
id: semantics_analysis
title: 意味解析
---

意味解析は、ソースコードが正しいかどうかをチェックするプロセスです。  
ECMAScript の仕様にあるすべての "Early Error" ルールに対してチェックする必要があります。

## コンテキスト

`[Yield]` や `[Await]` などの文法コンテキストでは、文法が禁止している場合にエラーを発生させる必要があります。例えば：

```markup
BindingIdentifier[Yield, Await] :
  Identifier
  yield
  await

13.1.1 Static Semantics: Early Errors

BindingIdentifier[Yield, Await] : yield
* このプロダクションに[Yield]パラメータがある場合、構文エラーです。

* BindingIdentifier[Yield, Await] : await
このプロダクションに[await]パラメータがある場合、構文エラーです。
```

次のコードに対してエラーを発生させる必要があります。

```javascript
async *
  function foo() {
    var yield, await;
  };
```

なぜなら、`AsyncGeneratorDeclaration` には、`AsyncGeneratorBody` の `[+Yield]` と `[+Await]` があるからです。

```markup
AsyncGeneratorBody :
  FunctionBody[+Yield, +Await]
```

Romeの例では、`yield` キーワードのチェックを行っています。

```rust reference
https://github.com/rome/tools/blob/5a059c0413baf1d54436ac0c149a829f0dfd1f4d/crates/rome_js_parser/src/syntax/expr.rs#L1368-L1377
```

## スコープ

宣言エラーの場合：

```markup
14.2.1 Static Semantics: Early Errors

Block : { StatementList }
* StatementListのLexicallyDeclaredNamesに重複するエントリが含まれている場合、構文エラーです。
* StatementListのLexicallyDeclaredNamesの要素がStatementListのVarDeclaredNamesにも含まれている場合、構文エラーです。
```

スコープツリーを追加する必要があります。スコープツリーには、その中で宣言されたすべての `var` と `let` が含まれます。
また、親を指すツリーでもあり、親のスコープでバインディング識別子を検索するためにツリーを上に移動する必要があります。
使用できるデータ構造は [`indextree`](https://docs.rs/indextree/latest/indextree/)です。

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

スコープツリーは、パフォーマンスのためにパーサー内で構築するか、別の AST パスで構築するかのいずれかです。

一般的には、`ScopeBuilder` が必要です。

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
        // 関数の場合は厳密モードを継承する
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

その後、パース関数内で適切に `enter_scope` と `leave_scope` を呼び出します。例えば、acornでは：

```javascript reference
https://github.com/acornjs/acorn/blob/11735729c4ebe590e406f952059813f250a4cbd1/acorn/src/statement.js#L425-L437
```

:::info
このアプローチの欠点の1つは、アロー関数の場合、一時的なスコープを作成し、それがアロー関数ではなくシーケンス式である場合に後で削除する必要があるかもしれないことです。これについては、[ Cover Grammar ](/blog/grammar#cover-grammar)で詳しく説明しています。
:::

### ビジターパターン

シンプルさのためにスコープツリーを別のパスで構築することを決定した場合、AST の各ノードを深さ優先の事前順序で訪れ、スコープツリーを構築する必要があります。

[ビジターパターン](https://rust-unofficial.github.io/patterns/patterns/behavioural/visitor.html) を使用して、トラバーサルプロセスと各オブジェクトで実行される操作を分離することができます。

訪問時には、`enter_scope` と `leave_scope` を適切に呼び出してスコープツリーを構築することができます。
