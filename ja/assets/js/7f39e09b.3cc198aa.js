"use strict";(self.webpackChunkjavascript_parser_in_rust=self.webpackChunkjavascript_parser_in_rust||[]).push([[458],{3889:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>o,contentTitle:()=>i,default:()=>p,frontMatter:()=>r,metadata:()=>a,toc:()=>d});var t=s(1527),c=s(7660);const r={id:"semantics_analysis",title:"\u610f\u5473\u89e3\u6790"},i=void 0,a={id:"semantics_analysis",title:"\u610f\u5473\u89e3\u6790",description:"\u610f\u5473\u89e3\u6790\u306f\u3001\u30bd\u30fc\u30b9\u30b3\u30fc\u30c9\u304c\u6b63\u3057\u3044\u304b\u3069\u3046\u304b\u3092\u30c1\u30a7\u30c3\u30af\u3059\u308b\u30d7\u30ed\u30bb\u30b9\u3067\u3059\u3002",source:"@site/i18n/ja/docusaurus-plugin-content-docs/current/semantic_analysis.md",sourceDirName:".",slug:"/semantics_analysis",permalink:"/javascript-parser-in-rust/ja/docs/semantics_analysis",draft:!1,unlisted:!1,editUrl:"https://github.com/oxc-project/javascript-parser-in-rust/tree/main/docs/semantic_analysis.md",tags:[],version:"current",frontMatter:{id:"semantics_analysis",title:"\u610f\u5473\u89e3\u6790"},sidebar:"tutorialSidebar",previous:{title:"\u30a8\u30e9\u30fc\u51e6\u7406",permalink:"/javascript-parser-in-rust/ja/docs/errors"},next:{title:"TypeScript",permalink:"/javascript-parser-in-rust/ja/docs/typescript"}},o={},d=[{value:"\u30b3\u30f3\u30c6\u30ad\u30b9\u30c8",id:"\u30b3\u30f3\u30c6\u30ad\u30b9\u30c8",level:2},{value:"\u30b9\u30b3\u30fc\u30d7",id:"\u30b9\u30b3\u30fc\u30d7",level:2},{value:"\u30d3\u30b8\u30bf\u30fc\u30d1\u30bf\u30fc\u30f3",id:"\u30d3\u30b8\u30bf\u30fc\u30d1\u30bf\u30fc\u30f3",level:3}];function l(e){const n={a:"a",admonition:"admonition",br:"br",code:"code",h2:"h2",h3:"h3",p:"p",pre:"pre",...(0,c.a)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(n.p,{children:["\u610f\u5473\u89e3\u6790\u306f\u3001\u30bd\u30fc\u30b9\u30b3\u30fc\u30c9\u304c\u6b63\u3057\u3044\u304b\u3069\u3046\u304b\u3092\u30c1\u30a7\u30c3\u30af\u3059\u308b\u30d7\u30ed\u30bb\u30b9\u3067\u3059\u3002",(0,t.jsx)(n.br,{}),"\n",'ECMAScript \u306e\u4ed5\u69d8\u306b\u3042\u308b\u3059\u3079\u3066\u306e "Early Error" \u30eb\u30fc\u30eb\u306b\u5bfe\u3057\u3066\u30c1\u30a7\u30c3\u30af\u3059\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002']}),"\n",(0,t.jsx)(n.h2,{id:"\u30b3\u30f3\u30c6\u30ad\u30b9\u30c8",children:"\u30b3\u30f3\u30c6\u30ad\u30b9\u30c8"}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.code,{children:"[Yield]"})," \u3084 ",(0,t.jsx)(n.code,{children:"[Await]"})," \u306a\u3069\u306e\u6587\u6cd5\u30b3\u30f3\u30c6\u30ad\u30b9\u30c8\u3067\u306f\u3001\u6587\u6cd5\u304c\u7981\u6b62\u3057\u3066\u3044\u308b\u5834\u5408\u306b\u30a8\u30e9\u30fc\u3092\u767a\u751f\u3055\u305b\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002\u4f8b\u3048\u3070\uff1a"]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-markup",children:"BindingIdentifier[Yield, Await] :\n  Identifier\n  yield\n  await\n\n13.1.1 Static Semantics: Early Errors\n\nBindingIdentifier[Yield, Await] : yield\n* \u3053\u306e\u30d7\u30ed\u30c0\u30af\u30b7\u30e7\u30f3\u306b[Yield]\u30d1\u30e9\u30e1\u30fc\u30bf\u304c\u3042\u308b\u5834\u5408\u3001\u69cb\u6587\u30a8\u30e9\u30fc\u3067\u3059\u3002\n\n* BindingIdentifier[Yield, Await] : await\n\u3053\u306e\u30d7\u30ed\u30c0\u30af\u30b7\u30e7\u30f3\u306b[await]\u30d1\u30e9\u30e1\u30fc\u30bf\u304c\u3042\u308b\u5834\u5408\u3001\u69cb\u6587\u30a8\u30e9\u30fc\u3067\u3059\u3002\n"})}),"\n",(0,t.jsx)(n.p,{children:"\u6b21\u306e\u30b3\u30fc\u30c9\u306b\u5bfe\u3057\u3066\u30a8\u30e9\u30fc\u3092\u767a\u751f\u3055\u305b\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-javascript",children:"async *\n  function foo() {\n    var yield, await;\n  };\n"})}),"\n",(0,t.jsxs)(n.p,{children:["\u306a\u305c\u306a\u3089\u3001",(0,t.jsx)(n.code,{children:"AsyncGeneratorDeclaration"})," \u306b\u306f\u3001",(0,t.jsx)(n.code,{children:"AsyncGeneratorBody"})," \u306e ",(0,t.jsx)(n.code,{children:"[+Yield]"})," \u3068 ",(0,t.jsx)(n.code,{children:"[+Await]"})," \u304c\u3042\u308b\u304b\u3089\u3067\u3059\u3002"]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-markup",children:"AsyncGeneratorBody :\n  FunctionBody[+Yield, +Await]\n"})}),"\n",(0,t.jsxs)(n.p,{children:["Rome\u306e\u4f8b\u3067\u306f\u3001",(0,t.jsx)(n.code,{children:"yield"})," \u30ad\u30fc\u30ef\u30fc\u30c9\u306e\u30c1\u30a7\u30c3\u30af\u3092\u884c\u3063\u3066\u3044\u307e\u3059\u3002"]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-rust",metastring:"reference",children:"https://github.com/rome/tools/blob/5a059c0413baf1d54436ac0c149a829f0dfd1f4d/crates/rome_js_parser/src/syntax/expr.rs#L1368-L1377\n"})}),"\n",(0,t.jsx)(n.h2,{id:"\u30b9\u30b3\u30fc\u30d7",children:"\u30b9\u30b3\u30fc\u30d7"}),"\n",(0,t.jsx)(n.p,{children:"\u5ba3\u8a00\u30a8\u30e9\u30fc\u306e\u5834\u5408\uff1a"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-markup",children:"14.2.1 Static Semantics: Early Errors\n\nBlock : { StatementList }\n* StatementList\u306eLexicallyDeclaredNames\u306b\u91cd\u8907\u3059\u308b\u30a8\u30f3\u30c8\u30ea\u304c\u542b\u307e\u308c\u3066\u3044\u308b\u5834\u5408\u3001\u69cb\u6587\u30a8\u30e9\u30fc\u3067\u3059\u3002\n* StatementList\u306eLexicallyDeclaredNames\u306e\u8981\u7d20\u304cStatementList\u306eVarDeclaredNames\u306b\u3082\u542b\u307e\u308c\u3066\u3044\u308b\u5834\u5408\u3001\u69cb\u6587\u30a8\u30e9\u30fc\u3067\u3059\u3002\n"})}),"\n",(0,t.jsxs)(n.p,{children:["\u30b9\u30b3\u30fc\u30d7\u30c4\u30ea\u30fc\u3092\u8ffd\u52a0\u3059\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002\u30b9\u30b3\u30fc\u30d7\u30c4\u30ea\u30fc\u306b\u306f\u3001\u305d\u306e\u4e2d\u3067\u5ba3\u8a00\u3055\u308c\u305f\u3059\u3079\u3066\u306e ",(0,t.jsx)(n.code,{children:"var"})," \u3068 ",(0,t.jsx)(n.code,{children:"let"})," \u304c\u542b\u307e\u308c\u307e\u3059\u3002\n\u307e\u305f\u3001\u89aa\u3092\u6307\u3059\u30c4\u30ea\u30fc\u3067\u3082\u3042\u308a\u3001\u89aa\u306e\u30b9\u30b3\u30fc\u30d7\u3067\u30d0\u30a4\u30f3\u30c7\u30a3\u30f3\u30b0\u8b58\u5225\u5b50\u3092\u691c\u7d22\u3059\u308b\u305f\u3081\u306b\u30c4\u30ea\u30fc\u3092\u4e0a\u306b\u79fb\u52d5\u3059\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002\n\u4f7f\u7528\u3067\u304d\u308b\u30c7\u30fc\u30bf\u69cb\u9020\u306f ",(0,t.jsx)(n.a,{href:"https://docs.rs/indextree/latest/indextree/",children:(0,t.jsx)(n.code,{children:"indextree"})}),"\u3067\u3059\u3002"]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-rust",children:"use indextree::{Arena, Node, NodeId};\nuse bitflags::bitflags;\n\npub type Scopes = Arena<Scope>;\npub type ScopeId = NodeId;\n\nbitflags! {\n    #[derive(Default)]\n    pub struct ScopeFlags: u8 {\n        const TOP = 1 << 0;\n        const FUNCTION = 1 << 1;\n        const ARROW = 1 << 2;\n        const CLASS_STATIC_BLOCK = 1 << 4;\n        const VAR = Self::TOP.bits | Self::FUNCTION.bits | Self::CLASS_STATIC_BLOCK.bits;\n    }\n}\n\n#[derive(Debug, Clone)]\npub struct Scope {\n    /// [Strict Mode Code](https://tc39.es/ecma262/#sec-strict-mode-code)\n    /// [Use Strict Directive Prologue](https://tc39.es/ecma262/#sec-directive-prologues-and-the-use-strict-directive)\n    pub strict_mode: bool,\n\n    pub flags: ScopeFlags,\n\n    /// [Lexically Declared Names](https://tc39.es/ecma262/#sec-static-semantics-lexicallydeclarednames)\n    pub lexical: IndexMap<Atom, SymbolId, FxBuildHasher>,\n\n    /// [Var Declared Names](https://tc39.es/ecma262/#sec-static-semantics-vardeclarednames)\n    pub var: IndexMap<Atom, SymbolId, FxBuildHasher>,\n\n    /// Function Declarations\n    pub function: IndexMap<Atom, SymbolId, FxBuildHasher>,\n}\n"})}),"\n",(0,t.jsx)(n.p,{children:"\u30b9\u30b3\u30fc\u30d7\u30c4\u30ea\u30fc\u306f\u3001\u30d1\u30d5\u30a9\u30fc\u30de\u30f3\u30b9\u306e\u305f\u3081\u306b\u30d1\u30fc\u30b5\u30fc\u5185\u3067\u69cb\u7bc9\u3059\u308b\u304b\u3001\u5225\u306e AST \u30d1\u30b9\u3067\u69cb\u7bc9\u3059\u308b\u304b\u306e\u3044\u305a\u308c\u304b\u3067\u3059\u3002"}),"\n",(0,t.jsxs)(n.p,{children:["\u4e00\u822c\u7684\u306b\u306f\u3001",(0,t.jsx)(n.code,{children:"ScopeBuilder"})," \u304c\u5fc5\u8981\u3067\u3059\u3002"]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-rust",children:"pub struct ScopeBuilder {\n    scopes: Scopes,\n    root_scope_id: ScopeId,\n    current_scope_id: ScopeId,\n}\n\nimpl ScopeBuilder {\n    pub fn current_scope(&self) -> &Scope {\n        self.scopes[self.current_scope_id].get()\n    }\n\n    pub fn enter_scope(&mut self, flags: ScopeFlags) {\n        // \u95a2\u6570\u306e\u5834\u5408\u306f\u53b3\u5bc6\u30e2\u30fc\u30c9\u3092\u7d99\u627f\u3059\u308b\n        // https://tc39.es/ecma262/#sec-strict-mode-code\n        let mut strict_mode = self.scopes[self.root_scope_id].get().strict_mode;\n        let parent_scope = self.current_scope();\n        if !strict_mode\n            && parent_scope.flags.intersects(ScopeFlags::FUNCTION)\n            && parent_scope.strict_mode\n        {\n            strict_mode = true;\n        }\n\n        let scope = Scope::new(flags, strict_mode);\n        let new_scope_id = self.scopes.new_node(scope);\n        self.current_scope_id.append(new_scope_id, &mut self.scopes);\n        self.current_scope_id = new_scope_id;\n    }\n\n    pub fn leave_scope(&mut self) {\n      self.current_scope_id = self.scopes[self.current_scope_id].parent().unwrap();\n    }\n}\n"})}),"\n",(0,t.jsxs)(n.p,{children:["\u305d\u306e\u5f8c\u3001\u30d1\u30fc\u30b9\u95a2\u6570\u5185\u3067\u9069\u5207\u306b ",(0,t.jsx)(n.code,{children:"enter_scope"})," \u3068 ",(0,t.jsx)(n.code,{children:"leave_scope"})," \u3092\u547c\u3073\u51fa\u3057\u307e\u3059\u3002\u4f8b\u3048\u3070\u3001acorn\u3067\u306f\uff1a"]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-javascript",metastring:"reference",children:"https://github.com/acornjs/acorn/blob/11735729c4ebe590e406f952059813f250a4cbd1/acorn/src/statement.js#L425-L437\n"})}),"\n",(0,t.jsx)(n.admonition,{type:"info",children:(0,t.jsxs)(n.p,{children:["\u3053\u306e\u30a2\u30d7\u30ed\u30fc\u30c1\u306e\u6b20\u70b9\u306e1\u3064\u306f\u3001\u30a2\u30ed\u30fc\u95a2\u6570\u306e\u5834\u5408\u3001\u4e00\u6642\u7684\u306a\u30b9\u30b3\u30fc\u30d7\u3092\u4f5c\u6210\u3057\u3001\u305d\u308c\u304c\u30a2\u30ed\u30fc\u95a2\u6570\u3067\u306f\u306a\u304f\u30b7\u30fc\u30b1\u30f3\u30b9\u5f0f\u3067\u3042\u308b\u5834\u5408\u306b\u5f8c\u3067\u524a\u9664\u3059\u308b\u5fc5\u8981\u304c\u3042\u308b\u304b\u3082\u3057\u308c\u306a\u3044\u3053\u3068\u3067\u3059\u3002\u3053\u308c\u306b\u3064\u3044\u3066\u306f\u3001",(0,t.jsx)(n.a,{href:"/blog/grammar#cover-grammar",children:" Cover Grammar "}),"\u3067\u8a73\u3057\u304f\u8aac\u660e\u3057\u3066\u3044\u307e\u3059\u3002"]})}),"\n",(0,t.jsx)(n.h3,{id:"\u30d3\u30b8\u30bf\u30fc\u30d1\u30bf\u30fc\u30f3",children:"\u30d3\u30b8\u30bf\u30fc\u30d1\u30bf\u30fc\u30f3"}),"\n",(0,t.jsx)(n.p,{children:"\u30b7\u30f3\u30d7\u30eb\u3055\u306e\u305f\u3081\u306b\u30b9\u30b3\u30fc\u30d7\u30c4\u30ea\u30fc\u3092\u5225\u306e\u30d1\u30b9\u3067\u69cb\u7bc9\u3059\u308b\u3053\u3068\u3092\u6c7a\u5b9a\u3057\u305f\u5834\u5408\u3001AST \u306e\u5404\u30ce\u30fc\u30c9\u3092\u6df1\u3055\u512a\u5148\u306e\u4e8b\u524d\u9806\u5e8f\u3067\u8a2a\u308c\u3001\u30b9\u30b3\u30fc\u30d7\u30c4\u30ea\u30fc\u3092\u69cb\u7bc9\u3059\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002"}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.a,{href:"https://rust-unofficial.github.io/patterns/patterns/behavioural/visitor.html",children:"\u30d3\u30b8\u30bf\u30fc\u30d1\u30bf\u30fc\u30f3"})," \u3092\u4f7f\u7528\u3057\u3066\u3001\u30c8\u30e9\u30d0\u30fc\u30b5\u30eb\u30d7\u30ed\u30bb\u30b9\u3068\u5404\u30aa\u30d6\u30b8\u30a7\u30af\u30c8\u3067\u5b9f\u884c\u3055\u308c\u308b\u64cd\u4f5c\u3092\u5206\u96e2\u3059\u308b\u3053\u3068\u304c\u3067\u304d\u307e\u3059\u3002"]}),"\n",(0,t.jsxs)(n.p,{children:["\u8a2a\u554f\u6642\u306b\u306f\u3001",(0,t.jsx)(n.code,{children:"enter_scope"})," \u3068 ",(0,t.jsx)(n.code,{children:"leave_scope"})," \u3092\u9069\u5207\u306b\u547c\u3073\u51fa\u3057\u3066\u30b9\u30b3\u30fc\u30d7\u30c4\u30ea\u30fc\u3092\u69cb\u7bc9\u3059\u308b\u3053\u3068\u304c\u3067\u304d\u307e\u3059\u3002"]})]})}function p(e={}){const{wrapper:n}={...(0,c.a)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(l,{...e})}):l(e)}},7660:(e,n,s)=>{s.d(n,{Z:()=>a,a:()=>i});var t=s(959);const c={},r=t.createContext(c);function i(e){const n=t.useContext(r);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function a(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(c):e.components||c:i(e.components),t.createElement(r.Provider,{value:n},e.children)}}}]);