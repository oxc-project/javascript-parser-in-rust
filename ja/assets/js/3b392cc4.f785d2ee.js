"use strict";(self.webpackChunkjavascript_parser_in_rust=self.webpackChunkjavascript_parser_in_rust||[]).push([[57],{5852:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>a,contentTitle:()=>c,default:()=>p,frontMatter:()=>t,metadata:()=>l,toc:()=>d});var i=s(1527),r=s(7660);const t={title:"ECMAScript \u306e\u4ed5\u69d8"},c=void 0,l={permalink:"/javascript-parser-in-rust/ja/blog/ecma-spec",editUrl:"https://github.com/oxc-project/javascript-parser-in-rust/tree/main/blog/ecma-spec.md",source:"@site/i18n/ja/docusaurus-plugin-content-blog/ecma-spec.md",title:"ECMAScript \u306e\u4ed5\u69d8",description:"ECMAScript\xae 2023\u8a00\u8a9e\u4ed5\u69d8\u66f8 \u306f\u3001JavaScript \u306b\u3064\u3044\u3066\u306e\u3059\u3079\u3066\u306e\u8a73\u7d30\u3092\u8a18\u8f09\u3057\u3066\u304a\u308a\u3001\u8ab0\u3067\u3082\u72ec\u81ea\u306e JavaScript \u30a8\u30f3\u30b8\u30f3\u3092\u5b9f\u88c5\u3059\u308b\u3053\u3068\u304c\u3067\u304d\u307e\u3059\u3002",date:"2023-11-12T16:10:41.000Z",formattedDate:"2023\u5e7411\u670812\u65e5",tags:[],readingTime:5.185,hasTruncateMarker:!1,authors:[],frontMatter:{title:"ECMAScript \u306e\u4ed5\u69d8"},unlisted:!1,prevItem:{title:"\u6587\u6cd5",permalink:"/javascript-parser-in-rust/ja/blog/grammar"},nextItem:{title:"\u30d1\u30fc\u30b5\u30fc\u306e\u9069\u5408\u8a66\u9a13",permalink:"/javascript-parser-in-rust/ja/blog/conformance"}},a={authorsImageUrls:[]},d=[{value:"\u8868\u8a18\u898f\u5247",id:"\u8868\u8a18\u898f\u5247",level:2},{value:"\u518d\u5e30",id:"\u518d\u5e30",level:3},{value:"\u30aa\u30d7\u30b7\u30e7\u30f3",id:"\u30aa\u30d7\u30b7\u30e7\u30f3",level:3},{value:"\u30d1\u30e9\u30e1\u30fc\u30bf",id:"\u30d1\u30e9\u30e1\u30fc\u30bf",level:3},{value:"\u30bd\u30fc\u30b9\u30c6\u30ad\u30b9\u30c8",id:"\u30bd\u30fc\u30b9\u30c6\u30ad\u30b9\u30c8",level:2},{value:"ECMAScript\u8a00\u8a9e\uff1a\u5b57\u53e5\u6587\u6cd5",id:"ecmascript\u8a00\u8a9e\u5b57\u53e5\u6587\u6cd5",level:2},{value:"\u81ea\u52d5\u30bb\u30df\u30b3\u30ed\u30f3\u633f\u5165",id:"\u81ea\u52d5\u30bb\u30df\u30b3\u30ed\u30f3\u633f\u5165",level:3},{value:"\u5f0f\u3001\u6587\u3001\u95a2\u6570\u3001\u30af\u30e9\u30b9\u3001\u30b9\u30af\u30ea\u30d7\u30c8\u3001\u30e2\u30b8\u30e5\u30fc\u30eb",id:"\u5f0f\u6587\u95a2\u6570\u30af\u30e9\u30b9\u30b9\u30af\u30ea\u30d7\u30c8\u30e2\u30b8\u30e5\u30fc\u30eb",level:2},{value:"\u4ed8\u9332B",id:"\u4ed8\u9332b",level:2}];function o(e){const n={a:"a",admonition:"admonition",blockquote:"blockquote",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,r.a)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"https://tc39.es/ecma262/",children:"ECMAScript\xae 2023\u8a00\u8a9e\u4ed5\u69d8\u66f8"})," \u306f\u3001JavaScript \u306b\u3064\u3044\u3066\u306e\u3059\u3079\u3066\u306e\u8a73\u7d30\u3092\u8a18\u8f09\u3057\u3066\u304a\u308a\u3001\u8ab0\u3067\u3082\u72ec\u81ea\u306e JavaScript \u30a8\u30f3\u30b8\u30f3\u3092\u5b9f\u88c5\u3059\u308b\u3053\u3068\u304c\u3067\u304d\u307e\u3059\u3002"]}),"\n",(0,i.jsx)(n.p,{children:"\u4ee5\u4e0b\u306e\u7ae0\u3092\u79c1\u305f\u3061\u306e\u30d1\u30fc\u30b5\u30fc\u306e\u305f\u3081\u306b\u5b66\u7fd2\u3059\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\uff1a"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:"\u7b2c5\u7ae0\uff1a\u8868\u8a18\u898f\u5247"}),"\n",(0,i.jsx)(n.li,{children:"\u7b2c11\u7ae0\uff1aECMAScript \u8a00\u8a9e\uff1a\u30bd\u30fc\u30b9\u30c6\u30ad\u30b9\u30c8"}),"\n",(0,i.jsx)(n.li,{children:"\u7b2c12\u7ae0\uff1aECMAScript \u8a00\u8a9e\uff1a\u5b57\u53e5\u6587\u6cd5"}),"\n",(0,i.jsx)(n.li,{children:"\u7b2c13\u7ae0\u301c\u7b2c16\u7ae0\uff1a\u5f0f\u3001\u6587\u3001\u95a2\u6570\u3001\u30af\u30e9\u30b9\u3001\u30b9\u30af\u30ea\u30d7\u30c8\u3001\u30e2\u30b8\u30e5\u30fc\u30eb"}),"\n",(0,i.jsx)(n.li,{children:"\u4ed8\u9332B\uff1aWeb \u30d6\u30e9\u30a6\u30b6\u5411\u3051\u306e\u8ffd\u52a0 ECMAScript \u6a5f\u80fd"}),"\n",(0,i.jsx)(n.li,{children:"\u4ed8\u9332C\uff1aECMAScript \u306e\u53b3\u5bc6\u30e2\u30fc\u30c9"}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"\u4ed5\u69d8\u66f8\u5185\u306e\u30ca\u30d3\u30b2\u30fc\u30b7\u30e7\u30f3\u306e\u305f\u3081\u306b\uff1a"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:["\u30af\u30ea\u30c3\u30af\u53ef\u80fd\u306a\u3082\u306e\u306b\u306f\u6c38\u7d9a\u7684\u306a\u30ea\u30f3\u30af\u304c\u3042\u308a\u3001URL \u306b\u30a2\u30f3\u30ab\u30fc\u3068\u3057\u3066\u8868\u793a\u3055\u308c\u307e\u3059\u3002\u4f8b\uff1a",(0,i.jsx)(n.code,{children:"#sec-identifiers"})]}),"\n",(0,i.jsxs)(n.li,{children:["\u30db\u30d0\u30fc\u3059\u308b\u3068\u30c4\u30fc\u30eb\u30c1\u30c3\u30d7\u304c\u8868\u793a\u3055\u308c\u3001",(0,i.jsx)(n.code,{children:"References"})," \u3092\u30af\u30ea\u30c3\u30af\u3059\u308b\u3068\u305d\u306e\u53c2\u7167\u304c\u8868\u793a\u3055\u308c\u307e\u3059"]}),"\n"]}),"\n",(0,i.jsx)(n.h2,{id:"\u8868\u8a18\u898f\u5247",children:"\u8868\u8a18\u898f\u5247"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"https://tc39.es/ecma262/#sec-grammar-notation",children:"\u7b2c5.1.5\u7bc0 \u6587\u6cd5\u8868\u8a18"})," \u3092\u8aad\u3080\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002"]}),"\n",(0,i.jsx)(n.p,{children:"\u3053\u3053\u3067\u6ce8\u610f\u3059\u308b\u3079\u304d\u70b9\u306f\u6b21\u306e\u3068\u304a\u308a\u3067\u3059\uff1a"}),"\n",(0,i.jsx)(n.h3,{id:"\u518d\u5e30",children:"\u518d\u5e30"}),"\n",(0,i.jsx)(n.p,{children:"\u3053\u308c\u306f\u6587\u6cd5\u3067\u30ea\u30b9\u30c8\u304c\u8868\u793a\u3055\u308c\u308b\u65b9\u6cd5\u3067\u3059\u3002"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-markup",children:"ArgumentList :\n  AssignmentExpression\n  ArgumentList , AssignmentExpression\n"})}),"\n",(0,i.jsx)(n.p,{children:"\u3068\u3044\u3046\u610f\u5473\u3067\u3059"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-javascript",children:"a, b = 1, c = 2\n^_____________^ ArgumentList\n   ^__________^ ArgumentList, AssignmentExpression,\n          ^___^ AssignmentExpression\n"})}),"\n",(0,i.jsx)(n.h3,{id:"\u30aa\u30d7\u30b7\u30e7\u30f3",children:"\u30aa\u30d7\u30b7\u30e7\u30f3"}),"\n",(0,i.jsxs)(n.p,{children:["\u30aa\u30d7\u30b7\u30e7\u30f3\u306e\u69cb\u6587\u306b\u306f ",(0,i.jsx)(n.code,{children:"_opt_"})," \u63a5\u5c3e\u8f9e\u304c\u4ed8\u304d\u307e\u3059\u3002\u4f8b\u3048\u3070\u3001"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-markup",children:"VariableDeclaration :\n  BindingIdentifier Initializer_opt\n"})}),"\n",(0,i.jsx)(n.p,{children:"\u3068\u3044\u3046\u610f\u5473\u3067\u3059"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-javascript",children:"var binding_identifier;\nvar binding_identifier = Initializer;\n                       ______________ Initializer_opt\n"})}),"\n",(0,i.jsx)(n.h3,{id:"\u30d1\u30e9\u30e1\u30fc\u30bf",children:"\u30d1\u30e9\u30e1\u30fc\u30bf"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"[Return]"})," \u3068 ",(0,i.jsx)(n.code,{children:"[In]"})," \u306f\u6587\u6cd5\u306e\u30d1\u30e9\u30e1\u30fc\u30bf\u3067\u3059\u3002"]}),"\n",(0,i.jsx)(n.p,{children:"\u4f8b\u3048\u3070"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-markdup",children:"ScriptBody :\n    StatementList[~Yield, ~Await, ~Return]\n"})}),"\n",(0,i.jsx)(n.p,{children:"\u3068\u3044\u3046\u610f\u5473\u3067\u3059\u3002\u30c8\u30c3\u30d7\u30ec\u30d9\u30eb\u306e yield\u3001await\u3001return \u306f\u30b9\u30af\u30ea\u30d7\u30c8\u3067\u306f\u8a31\u53ef\u3055\u308c\u3066\u3044\u307e\u305b\u3093\u304c\u3001"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-markdup",children:"ModuleItem :\n  ImportDeclaration\n  ExportDeclaration\n  StatementListItem[~Yield, +Await, ~Return]\n"})}),"\n",(0,i.jsx)(n.p,{children:"\u3067\u306f\u30c8\u30c3\u30d7\u30ec\u30d9\u30eb\u306e await \u304c\u8a31\u53ef\u3055\u308c\u3066\u3044\u307e\u3059\u3002"}),"\n",(0,i.jsx)(n.h2,{id:"\u30bd\u30fc\u30b9\u30c6\u30ad\u30b9\u30c8",children:"\u30bd\u30fc\u30b9\u30c6\u30ad\u30b9\u30c8"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"https://tc39.es/ecma262/#sec-types-of-source-code",children:"\u7b2c11.2\u7bc0 \u30bd\u30fc\u30b9\u30b3\u30fc\u30c9\u306e\u7a2e\u985e"})," \u3067\u306f\u3001\u30b9\u30af\u30ea\u30d7\u30c8\u30b3\u30fc\u30c9\u3068\u30e2\u30b8\u30e5\u30fc\u30eb\u30b3\u30fc\u30c9\u306e\u9593\u306b\u306f\u5927\u304d\u306a\u9055\u3044\u304c\u3042\u308b\u3053\u3068\u304c\u8ff0\u3079\u3089\u308c\u3066\u3044\u307e\u3059\u3002\n\u307e\u305f\u3001\u53e4\u3044 JavaScript \u306e\u632f\u308b\u821e\u3044\u3092\u7981\u6b62\u3059\u308b\u305f\u3081\u306e ",(0,i.jsx)(n.code,{children:"use strict"})," \u30e2\u30fc\u30c9\u304c\u3042\u308a\u307e\u3059\u3002"]}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"\u30b9\u30af\u30ea\u30d7\u30c8\u30b3\u30fc\u30c9"})," \u306f\u53b3\u5bc6\u3067\u306f\u3042\u308a\u307e\u305b\u3093\u3002\u30b9\u30af\u30ea\u30d7\u30c8\u30b3\u30fc\u30c9\u3092\u53b3\u5bc6\u306b\u3059\u308b\u305f\u3081\u306b\u306f\u3001\u30d5\u30a1\u30a4\u30eb\u306e\u5148\u982d\u306b ",(0,i.jsx)(n.code,{children:"use strict"})," \u3092\u633f\u5165\u3059\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002\nHTML\u3067\u306f ",(0,i.jsx)(n.code,{children:'<script src="javascript.js"><\/script>'})," \u3068\u66f8\u304d\u307e\u3059\u3002"]}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"\u30e2\u30b8\u30e5\u30fc\u30eb\u30b3\u30fc\u30c9"})," \u306f\u81ea\u52d5\u7684\u306b\u53b3\u5bc6\u3067\u3059\u3002\nHTML\u3067\u306f ",(0,i.jsx)(n.code,{children:'<script type="module" src="main.mjs"><\/script>'})," \u3068\u66f8\u304d\u307e\u3059\u3002"]}),"\n",(0,i.jsx)(n.h2,{id:"ecmascript\u8a00\u8a9e\u5b57\u53e5\u6587\u6cd5",children:"ECMAScript\u8a00\u8a9e\uff1a\u5b57\u53e5\u6587\u6cd5"}),"\n",(0,i.jsxs)(n.p,{children:["\u3088\u308a\u8a73\u7d30\u306a\u8aac\u660e\u306b\u3064\u3044\u3066\u306f\u3001V8 \u30d6\u30ed\u30b0\u306e ",(0,i.jsx)(n.a,{href:"https://v8.dev/blog/understanding-ecmascript-part-3",children:"ECMAScript\u4ed5\u69d8\u306e\u7406\u89e3"})," \u3092\u8aad\u3093\u3067\u304f\u3060\u3055\u3044\u3002"]}),"\n",(0,i.jsx)(n.h3,{id:"\u81ea\u52d5\u30bb\u30df\u30b3\u30ed\u30f3\u633f\u5165",children:(0,i.jsx)(n.a,{href:"https://tc39.es/ecma262/#sec-automatic-semicolon-insertion",children:"\u81ea\u52d5\u30bb\u30df\u30b3\u30ed\u30f3\u633f\u5165"})}),"\n",(0,i.jsx)(n.p,{children:"\u3053\u306e\u30bb\u30af\u30b7\u30e7\u30f3\u3067\u306f\u3001JavaScript \u3092\u66f8\u304f\u969b\u306b\u30bb\u30df\u30b3\u30ed\u30f3\u3092\u7701\u7565\u3067\u304d\u308b\u30eb\u30fc\u30eb\u306b\u3064\u3044\u3066\u8aac\u660e\u3057\u3066\u3044\u307e\u3059\u3002\n\u3059\u3079\u3066\u306e\u8aac\u660e\u306f\u6b21\u306e\u3088\u3046\u306b\u8981\u7d04\u3055\u308c\u307e\u3059"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-rust",children:"    pub fn asi(&mut self) -> Result<()> {\n        if self.eat(Kind::Semicolon) || self.can_insert_semicolon() {\n            return Ok(());\n        }\n        let range = self.prev_node_end..self.cur_token().start;\n        Err(SyntaxError::AutoSemicolonInsertion(range.into()))\n    }\n\n    pub const fn can_insert_semicolon(&self) -> bool {\n        self.cur_token().is_on_new_line || matches!(self.cur_kind(), Kind::RCurly | Kind::Eof)\n    }\n"})}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"asi"})," \u95a2\u6570\u306f\u9069\u7528\u53ef\u80fd\u306a\u5834\u6240\u3067\u624b\u52d5\u3067\u547c\u3073\u51fa\u3059\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002\u4f8b\u3048\u3070\u3001\u6587\u306e\u6700\u5f8c\u3067\u547c\u3073\u51fa\u3055\u308c\u307e\u3059\u3002"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-rust",children:"    fn parse_debugger_statement(&mut self) -> Result<Statement<'a>> {\n        let node = self.start_node();\n        self.expect(Kind::Debugger)?;\n        // highlight-next-line\n        self.asi()?;\n        self.ast.debugger_statement(self.finish_node(node))\n    }\n"})}),"\n",(0,i.jsxs)(n.admonition,{type:"info",children:[(0,i.jsxs)(n.p,{children:["\u3053\u306e asi \u306e\u30bb\u30af\u30b7\u30e7\u30f3\u306f\u30d1\u30fc\u30b5\u30fc\u3092\u60f3\u5b9a\u3057\u3066\u66f8\u304b\u308c\u3066\u304a\u308a\u3001\u30bd\u30fc\u30b9\u30c6\u30ad\u30b9\u30c8\u306f\u5de6\u304b\u3089\u53f3\u306b\u89e3\u6790\u3055\u308c\u308b\u3053\u3068\u304c\u660e\u793a\u7684\u306b\u8ff0\u3079\u3089\u308c\u3066\u3044\u307e\u3059\u3002\u3053\u308c\u306b\u3088\u308a\u3001\u4ed6\u306e\u65b9\u6cd5\u3067\u30d1\u30fc\u30b5\u30fc\u3092\u66f8\u304f\u3053\u3068\u306f\u307b\u3068\u3093\u3069\u4e0d\u53ef\u80fd\u306b\u306a\u308a\u307e\u3059\u3002jsparagus \u306e\u4f5c\u8005\u306f ",(0,i.jsx)(n.a,{href:"https://github.com/mozilla-spidermonkey/jsparagus/blob/master/js-quirks.md#automatic-semicolon-insertion-",children:"\u3053\u3053"})," \u3067\u3053\u308c\u306b\u3064\u3044\u3066\u306e\u611a\u75f4\u3092\u8ff0\u3079\u3066\u3044\u307e\u3059\u3002"]}),(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsx)(n.p,{children:"\u3053\u306e\u6a5f\u80fd\u306e\u4ed5\u69d8\u306f\u975e\u5e38\u306b\u9ad8\u30ec\u30d9\u30eb\u3067\u3042\u308a\u3001\u5947\u5999\u306a\u624b\u7d9a\u304d\u7684\u306a\u3082\u306e\u3067\u3059\uff08\u300c\u30bd\u30fc\u30b9\u30c6\u30ad\u30b9\u30c8\u304c\u5de6\u304b\u3089\u53f3\u306b\u89e3\u6790\u3055\u308c\u308b\u3068\u304d\u306b\u3001\u30c8\u30fc\u30af\u30f3\u304c\u906d\u9047\u3055\u308c\u308b\u3068...\u300d\u3068\u3044\u3046\u3088\u3046\u306b\u3001\u4ed5\u69d8\u304c\u30d6\u30e9\u30a6\u30b6\u306b\u3064\u3044\u3066\u306e\u30b9\u30c8\u30fc\u30ea\u30fc\u3092\u8a9e\u3063\u3066\u3044\u308b\u304b\u306e\u3088\u3046\u3067\u3059\u3002\u79c1\u306e\u77e5\u308b\u9650\u308a\u3001\u3053\u308c\u306f\u89e3\u6790\u306e\u5185\u90e8\u5b9f\u88c5\u306e\u8a73\u7d30\u306b\u3064\u3044\u3066\u4f55\u304b\u304c\u524d\u63d0\u3055\u308c\u305f\u308a\u6697\u793a\u3055\u308c\u305f\u308a\u3059\u308b\u4ed5\u69d8\u306e\u552f\u4e00\u306e\u5834\u6240\u3067\u3059\u3002\uff09\u3057\u304b\u3057\u3001asi \u3092\u4ed6\u306e\u65b9\u6cd5\u3067\u6307\u5b9a\u3059\u308b\u306e\u306f\u96e3\u3057\u3044\u3067\u3057\u3087\u3046\u3002"}),"\n"]})]}),"\n",(0,i.jsx)(n.h2,{id:"\u5f0f\u6587\u95a2\u6570\u30af\u30e9\u30b9\u30b9\u30af\u30ea\u30d7\u30c8\u30e2\u30b8\u30e5\u30fc\u30eb",children:"\u5f0f\u3001\u6587\u3001\u95a2\u6570\u3001\u30af\u30e9\u30b9\u3001\u30b9\u30af\u30ea\u30d7\u30c8\u3001\u30e2\u30b8\u30e5\u30fc\u30eb"}),"\n",(0,i.jsxs)(n.p,{children:["\u69cb\u6587\u7684\u306a\u6587\u6cd5\u3092\u7406\u89e3\u3057\u3001\u305d\u308c\u3092\u30d1\u30fc\u30b5\u30fc\u306e\u4f5c\u6210\u306b\u9069\u7528\u3059\u308b\u306b\u306f\u6642\u9593\u304c\u304b\u304b\u308a\u307e\u3059\u3002\n\u3088\u308a\u8a73\u7d30\u306a\u5185\u5bb9\u306f\u3001",(0,i.jsx)(n.a,{href:"./blog/grammar",children:"\u6587\u6cd5\u30c1\u30e5\u30fc\u30c8\u30ea\u30a2\u30eb"})," \u3067\u898b\u3064\u3051\u308b\u3053\u3068\u304c\u3067\u304d\u307e\u3059\u3002"]}),"\n",(0,i.jsx)(n.h2,{id:"\u4ed8\u9332b",children:"\u4ed8\u9332B"})]})}function p(e={}){const{wrapper:n}={...(0,r.a)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(o,{...e})}):o(e)}},7660:(e,n,s)=>{s.d(n,{Z:()=>l,a:()=>c});var i=s(959);const r={},t=i.createContext(r);function c(e){const n=i.useContext(t);return i.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:c(e.components),i.createElement(t.Provider,{value:n},e.children)}}}]);