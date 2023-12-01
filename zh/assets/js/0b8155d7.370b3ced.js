"use strict";(self.webpackChunkjavascript_parser_in_rust=self.webpackChunkjavascript_parser_in_rust||[]).push([[417],{2698:(e,n,r)=>{r.r(n),r.d(n,{assets:()=>l,contentTitle:()=>d,default:()=>h,frontMatter:()=>c,metadata:()=>t,toc:()=>a});var s=r(1527),i=r(7660);const c={id:"lexer",title:"\u8bcd\u6cd5\u5206\u6790\u5668 (Lexer)"},d=void 0,t={id:"lexer",title:"\u8bcd\u6cd5\u5206\u6790\u5668 (Lexer)",description:"Token",source:"@site/i18n/zh/docusaurus-plugin-content-docs/current/lexer.md",sourceDirName:".",slug:"/lexer",permalink:"/javascript-parser-in-rust/zh/docs/lexer",draft:!1,unlisted:!1,editUrl:"https://github.com/oxc-project/javascript-parser-in-rust/tree/main/docs/lexer.md",tags:[],version:"current",frontMatter:{id:"lexer",title:"\u8bcd\u6cd5\u5206\u6790\u5668 (Lexer)"},sidebar:"tutorialSidebar",previous:{title:"\u603b\u89c8",permalink:"/javascript-parser-in-rust/zh/docs/overview"},next:{title:"\u62bd\u8c61\u8bed\u6cd5\u6811 (Abstract Syntax Tree)",permalink:"/javascript-parser-in-rust/zh/docs/ast"}},l={},a=[{value:"Token",id:"token",level:2},{value:"Peek",id:"peek",level:2},{value:"JavaScript",id:"javascript",level:2},{value:"\u6ce8\u91ca",id:"\u6ce8\u91ca",level:3},{value:"\u6807\u8bc6\u7b26\u548c Unicode",id:"\u6807\u8bc6\u7b26\u548c-unicode",level:3},{value:"\u5173\u952e\u5b57",id:"\u5173\u952e\u5b57",level:3},{value:"Token \u7684\u503c",id:"token-\u7684\u503c",level:3},{value:"Rust \u4f18\u5316",id:"rust-\u4f18\u5316",level:2},{value:"\u66f4\u5c0f\u7684 Token",id:"\u66f4\u5c0f\u7684-token",level:3},{value:"String Interning",id:"string-interning",level:3}];function o(e){const n={a:"a",admonition:"admonition",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,i.a)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.h2,{id:"token",children:"Token"}),"\n",(0,s.jsx)(n.p,{children:"\u8bcd\u6cd5\u5206\u6790\u5668 (lexer)\uff0c\u4e5f\u79f0\u4e3a\u5206\u8bcd\u5668 (tokenizer) \u6216\u626b\u63cf\u5668 (scanner)\uff0c\u8d1f\u8d23\u5c06\u6e90\u6587\u672c\u8f6c\u6362\u4e3a\u8bcd\u5143 (tokens)\u3002\n\u8fd9\u4e9b token \u7a0d\u540e\u5c06\u88ab\u89e3\u6790\u5668\u6d88\u8d39\uff0c\u56e0\u6b64\u6211\u4eec\u4e0d\u5fc5\u62c5\u5fc3\u539f\u59cb\u6587\u672c\u4e2d\u7684\u7a7a\u683c\u548c\u6ce8\u91ca\u3002"}),"\n",(0,s.jsxs)(n.p,{children:["\u8ba9\u6211\u4eec\u5148\u4ece\u7b80\u5355\u7684\u5f00\u59cb\uff1a\u5c06\u5355\u4e2a ",(0,s.jsx)(n.code,{children:"+"})," \u6587\u672c\u8f6c\u6362\u4e3a\u4e00\u4e2a token\u3002"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-rust",children:"#[derive(Debug, Clone, Copy, PartialEq)]\npub struct Token {\n    /// token \u7c7b\u578b\n    pub kind: Kind,\n\n    /// \u6e90\u6587\u672c\u4e2d\u7684\u8d77\u59cb\u504f\u79fb\u91cf\n    pub start: usize,\n\n    /// \u6e90\u6587\u672c\u4e2d\u7684\u7ed3\u675f\u504f\u79fb\u91cf\n    pub end: usize,\n}\n\n#[derive(Debug, Clone, Copy, PartialEq)]\npub enum Kind {\n    Eof, // \u6587\u4ef6\u7ed3\u5c3e\n    Plus,\n}\n"})}),"\n",(0,s.jsxs)(n.p,{children:["\u5bf9\u4e8e\u5355\u4e2a ",(0,s.jsx)(n.code,{children:"+"})," \u4f1a\u8f93\u51fa\uff1a"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{children:"[\n    Token { kind: Kind::Plus, start: 0, end: 1 },\n    Token { kind: Kind::Eof,  start: 1, end: 1 }\n]\n"})}),"\n",(0,s.jsxs)(n.p,{children:["\u4e3a\u4e86\u904d\u5386\u5b57\u7b26\u4e32\uff0c\u6211\u4eec\u53ef\u4ee5\u5982\u540c\u5199 C \u4ee3\u7801\u90a3\u6837\u7ef4\u62a4\u4e00\u4e2a\u7d22\u5f15\uff1b\n\u53c8\u6216\u8005\u6211\u4eec\u53ef\u4ee5\u67e5\u770b ",(0,s.jsx)(n.a,{href:"https://doc.rust-lang.org/std/primitive.str.html#",children:"str \u7684\u6587\u6863"}),"\n\u5e76\u4f7f\u7528 ",(0,s.jsx)(n.a,{href:"https://doc.rust-lang.org/std/str/struct.Chars.html",children:(0,s.jsx)(n.code,{children:"Chars"})})," \u8fed\u4ee3\u5668\u3002"]}),"\n",(0,s.jsxs)(n.admonition,{type:"info",children:[(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"Chars"})," \u8fed\u4ee3\u5668\u62bd\u8c61\u6389\u4e86\u7d22\u5f15\u7684\u7ef4\u62a4\u548c\u8fb9\u754c\u68c0\u67e5\u7b49\u7ec6\u8282\uff0c\u8ba9\u6211\u4eec\u5199\u4ee3\u7801\u7684\u65f6\u5019\u5145\u6ee1\u5b89\u5168\u611f\u3002"]}),(0,s.jsxs)(n.p,{children:["\u5f53\u6211\u4eec\u8c03\u7528 ",(0,s.jsx)(n.code,{children:"chars.next()"})," \u65f6\uff0c\u5b83\u4f1a\u8fd4\u56de ",(0,s.jsx)(n.code,{children:"Option<char>"}),"\u3002\n\u4f46\u8bf7\u6ce8\u610f\uff0c",(0,s.jsx)(n.code,{children:"char"})," \u4e0d\u662f 0 \u5230 255 \u7684 ASCII \u503c\uff0c\u800c\u662f\u4e00\u4e2a\u8303\u56f4\u5728 0 \u5230 0x10FFFF \u4e4b\u95f4\u7684 UTF-8 Unicode \u7801\u70b9\u503c\u3002"]})]}),"\n",(0,s.jsx)(n.p,{children:"\u8ba9\u6211\u4eec\u5b9a\u4e49\u4e00\u4e2a\u521d\u6b65\u7684\u8bcd\u6cd5\u5206\u6790\u5668\u62bd\u8c61\uff1a"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-rust",children:"use std::str::Chars;\n\nstruct Lexer<'a> {\n    /// \u6e90\u6587\u672c\n    source: &'a str,\n\n    /// \u5269\u4f59\u7684\u5b57\u7b26\n    chars: Chars<'a>\n}\n\nimpl<'a> Lexer<'a> {\n    pub fn new(source: &'a str) -> Self {\n        Self {\n            source,\n            chars: source.chars()\n        }\n    }\n}\n"})}),"\n",(0,s.jsx)(n.admonition,{type:"info",children:(0,s.jsxs)(n.p,{children:["\u8fd9\u91cc\u7684\u751f\u547d\u5468\u671f ",(0,s.jsx)(n.code,{children:"'a"})," \u8868\u793a\u8fed\u4ee3\u5668\u6301\u6709\u5bf9\u67d0\u4e2a\u5730\u65b9\u7684\u5f15\u7528\u3002\u5728\u8fd9\u91cc\uff0c\u5b83\u5f15\u7528\u4e86\u4e00\u4e2a ",(0,s.jsx)(n.code,{children:"&'a str"}),"\u3002"]})}),"\n",(0,s.jsxs)(n.p,{children:["\u8981\u5c06\u6e90\u6587\u672c\u8f6c\u6362\u4e3a token \uff0c\u53ea\u9700\u4e0d\u65ad\u8c03\u7528 ",(0,s.jsx)(n.code,{children:"chars.next()"})," \u5e76\u5bf9\u8fd4\u56de\u7684 ",(0,s.jsx)(n.code,{children:"char"}),"\u8fdb\u884c\u6a21\u5f0f\u5339\u914d\u3002\n\u6700\u540e\u4e00\u4e2a token \u5c06\u59cb\u7ec8\u662f ",(0,s.jsx)(n.code,{children:"Kind::Eof"}),"\u3002"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-rust",children:"impl<'a> Lexer<'a> {\n    fn read_next_kind(&mut self) -> Kind {\n        while let Some(c) = self.chars.next() {\n            match c {\n              '+' => return Kind::Plus,\n              _ => {}\n            }\n        }\n        Kind::Eof\n    }\n\n    fn read_next_token(&mut self) -> Token {\n        let start = self.offset();\n        let kind = self.read_next_kind();\n        let end = self.offset();\n        Token { kind, start, end }\n    }\n\n    /// \u83b7\u53d6\u4ece\u6e90\u6587\u672c\u4e2d\u7684\u504f\u79fb\u957f\u5ea6\uff0c\u4ee5 UTF-8 \u5b57\u8282\u8868\u793a\n    fn offset(&self) -> usize {\n        self.source.len() - self.chars.as_str().len()\n    }\n}\n"})}),"\n",(0,s.jsxs)(n.p,{children:["\u5728 ",(0,s.jsx)(n.code,{children:"fn offset"})," \u4e2d\uff0c",(0,s.jsx)(n.code,{children:".len()"})," \u548c ",(0,s.jsx)(n.code,{children:".as_str().len()"})," \u65b9\u6cd5\u770b\u8d77\u6765\u50cf\u662f O(n) \u7684\uff0c\u6240\u4ee5\u8ba9\u6211\u4eec\u8fdb\u4e00\u6b65\u770b\u770b\u662f\u5426\u5982\u6b64\u3002"]}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"https://doc.rust-lang.org/src/core/str/iter.rs.html#112",children:(0,s.jsx)(n.code,{children:".as_str()"})})," \u8fd4\u56de\u4e00\u4e2a\u6307\u5411\u5b57\u7b26\u4e32\u5207\u7247\u7684\u6307\u9488"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-rust",metastring:"reference",children:"https://github.com/rust-lang/rust/blob/b998821e4c51c44a9ebee395c91323c374236bbb/library/core/src/str/iter.rs#L112-L115\n"})}),"\n",(0,s.jsxs)(n.p,{children:["\u5207\u7247 (",(0,s.jsx)(n.a,{href:"https://doc.rust-lang.org/std/slice/index.html",children:"slice"}),")\u662f\u5bf9\u4e00\u5757\u5185\u5b58\u7684\u89c6\u56fe\uff0c\u5b83\u901a\u8fc7\u6307\u9488\u548c\u957f\u5ea6\u8868\u793a\u3002\n",(0,s.jsx)(n.code,{children:".len()"})," \u65b9\u6cd5\u8fd4\u56de\u5207\u7247\u5185\u90e8\u5b58\u50a8\u7684\u5143\u6570\u636e"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-rust",metastring:"reference",children:"https://github.com/rust-lang/rust/blob/b998821e4c51c44a9ebee395c91323c374236bbb/library/core/src/str/mod.rs#L157-L159\n"})}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-rust",metastring:"reference",children:"https://github.com/rust-lang/rust/blob/b998821e4c51c44a9ebee395c91323c374236bbb/library/core/src/str/mod.rs#L323-L325\n"})}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-rust",metastring:"reference",children:"https://github.com/rust-lang/rust/blob/b998821e4c51c44a9ebee395c91323c374236bbb/library/core/src/slice/mod.rs#L129-L138\n"})}),"\n",(0,s.jsxs)(n.p,{children:["\u4e0a\u9762\u63d0\u5230\u7684\u8fd9\u4e24\u4e2a\u65b9\u6cd5\u5728\u7f16\u8bd1\u4e4b\u540e\u90fd\u4f1a\u6210\u4e3a\u5355\u6b21\u6570\u636e\u8bfb\u53d6\uff0c\u56e0\u6b64 ",(0,s.jsx)(n.code,{children:".as_str().len()"})," \u5b9e\u9645\u4e0a\u662f O(1)\u7684\u3002"]}),"\n",(0,s.jsx)(n.h2,{id:"peek",children:"Peek"}),"\n",(0,s.jsxs)(n.p,{children:["\u8981\u5bf9",(0,s.jsx)(n.code,{children:"++"}),"\u6216",(0,s.jsx)(n.code,{children:"+="}),"\u7b49\u591a\u5b57\u7b26\u8fd0\u7b97\u7b26\u8fdb\u884c\u5206\u8bcd\uff0c\u9700\u8981\u4e00\u4e2a\u540d\u4e3a",(0,s.jsx)(n.code,{children:"peek"}),"\u7684\u8f85\u52a9\u51fd\u6570\uff1a"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-rust",children:"fn peek(&self) -> Option<char> {\n    self.chars.clone().next()\n}\n"})}),"\n",(0,s.jsxs)(n.p,{children:["\u6211\u4eec\u4e0d\u5e0c\u671b\u76f4\u63a5\u524d\u79fb (advance) \u539f\u59cb\u7684",(0,s.jsx)(n.code,{children:"chars"}),"\u8fed\u4ee3\u5668\uff0c\u56e0\u6b64\u6211\u4eec\u514b\u9686\u8fed\u4ee3\u5668\u540e\u518d\u524d\u79fb\u3002"]}),"\n",(0,s.jsxs)(n.admonition,{type:"info",children:[(0,s.jsxs)(n.p,{children:["\u5982\u679c\u6211\u4eec\u6df1\u5165\u67e5\u770b",(0,s.jsx)(n.a,{href:"https://doc.rust-lang.org/src/core/slice/iter.rs.html#148-152",children:"\u6e90\u4ee3\u7801"}),"\uff0c",(0,s.jsx)(n.code,{children:"clone"}),"\u64cd\u4f5c\u662f\u975e\u5e38\u5ec9\u4ef7\u7684\uff0c\u5b83\u53ea\u662f\u590d\u5236\u4e86\u5f53\u524d\u7d22\u5f15\u548c\u7d22\u5f15\u8fb9\u754c\u3002"]}),(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-rust",metastring:"reference",children:"https://github.com/rust-lang/rust/blob/b998821e4c51c44a9ebee395c91323c374236bbb/library/core/src/slice/iter.rs#L148-L152\n"})})]}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"peek"}),"\u548c",(0,s.jsx)(n.code,{children:"chars.next()"}),"\u7684\u533a\u522b\u5728\u4e8e\u524d\u8005\u603b\u662f\u8fd4\u56de",(0,s.jsx)(n.strong,{children:"\u76f8\u540c\u7684"}),"\u4e0b\u4e00\u4e2a",(0,s.jsx)(n.code,{children:"char"}),"\uff0c\u800c\u540e\u8005\u4f1a\u524d\u79fb\u8fed\u4ee3\u5668\u5e76\u8fd4\u56de\u4e0d\u540c\u7684",(0,s.jsx)(n.code,{children:"char"}),"\u3002"]}),"\n",(0,s.jsxs)(n.p,{children:["\u4e3e\u4f8b\u6765\u8bf4\uff0c\u8003\u8651\u5b57\u7b26\u4e32",(0,s.jsx)(n.code,{children:"abc"}),"\uff1a"]}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:["\u91cd\u590d\u8c03\u7528",(0,s.jsx)(n.code,{children:"peek()"}),"\u4f1a\u8fd4\u56de",(0,s.jsx)(n.code,{children:"Some(a)"}),"\uff0c",(0,s.jsx)(n.code,{children:"Some(a)"}),"\uff0c",(0,s.jsx)(n.code,{children:"Some(a)"}),"\uff0c..."]}),"\n",(0,s.jsxs)(n.li,{children:["\u91cd\u590d\u8c03\u7528",(0,s.jsx)(n.code,{children:"chars.next()"}),"\u4f1a\u8fd4\u56de",(0,s.jsx)(n.code,{children:"Some('a')"}),"\uff0c",(0,s.jsx)(n.code,{children:"Some('b')"}),"\uff0c",(0,s.jsx)(n.code,{children:"Some('c')"}),"\uff0c",(0,s.jsx)(n.code,{children:"None"}),"\u3002"]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["\u6709\u4e86",(0,s.jsx)(n.code,{children:"peek"}),"\uff0c\u5bf9",(0,s.jsx)(n.code,{children:"++"}),"\u548c",(0,s.jsx)(n.code,{children:"+="}),"\u8fdb\u884c\u5206\u8bcd\u53ea\u9700\u8981\u5d4c\u5957\u7684if\u8bed\u53e5\u3002"]}),"\n",(0,s.jsxs)(n.p,{children:["\u4ee5\u4e0b\u662f\u6765\u81ea",(0,s.jsx)(n.a,{href:"https://github.com/mozilla-spidermonkey/jsparagus",children:"jsparagus"}),"\u7684\u771f\u5b9e\u5b9e\u73b0\uff1a"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-rust",metastring:"reference",children:"https://github.com/mozilla-spidermonkey/jsparagus/blob/master/crates/parser/src/lexer.rs#L1769-L1791\n"})}),"\n",(0,s.jsx)(n.p,{children:"\u4e0a\u8ff0\u903b\u8f91\u5b9e\u9645\u4e0a\u9002\u7528\u4e8e\u6240\u6709\u8fd0\u7b97\u7b26\uff0c\u56e0\u6b64\u8ba9\u6211\u4eec\u5c06\u5b66\u5230\u7684\u77e5\u8bc6\u6269\u5c55\u5230\u5bf9 JavaScript \u7684\u8bcd\u6cd5\u5206\u6790\u4e0a\u8bd5\u8bd5\u3002"}),"\n",(0,s.jsx)(n.h2,{id:"javascript",children:"JavaScript"}),"\n",(0,s.jsxs)(n.p,{children:["\u7528 Rust \u7f16\u5199\u7684\u8bcd\u6cd5\u5206\u6790\u5668\u76f8\u5f53\u65e0\u804a\uff0c\u611f\u89c9\u5c31\u50cf\u5199 C \u4ee3\u7801\u4e00\u6837\uff0c\u6211\u4eec\u5199\u957f\u957f\u7684 if \u8bed\u53e5\u5e76\u68c0\u67e5\u6bcf\u4e2a",(0,s.jsx)(n.code,{children:"char"}),"\uff0c\u7136\u540e\u8fd4\u56de\u76f8\u5e94\u7684 token\u3002"]}),"\n",(0,s.jsx)(n.p,{children:"\u5bf9 JavaScript \u7684\u8bcd\u6cd5\u5206\u6790\u624d\u662f\u771f\u6b63\u6709\u8da3\u7684\u90e8\u5206\u3002"}),"\n",(0,s.jsxs)(n.p,{children:["\u8ba9\u6211\u4eec\u6253\u5f00",(0,s.jsx)(n.a,{href:"https://tc39.es/ecma262/",children:"\u300aECMAScript\u8bed\u8a00\u89c4\u8303\u300b"}),"\u5e76\u91cd\u65b0\u5b66\u4e60 JavaScript\u3002"]}),"\n",(0,s.jsx)(n.admonition,{type:"caution",children:(0,s.jsxs)(n.p,{children:["\u6211\u4ecd\u7136\u8bb0\u5f97\u7b2c\u4e00\u6b21\u6253\u5f00\u89c4\u8303\u65f6\uff0c\u6211\u4ec5\u4ec5\u5077\u7784\u4e86\u51e0\u4e2a\u5b57\u5c31\u9677\u5165\u75db\u82e6\u3001\u6cea\u6d41\u6ee1\u9762\uff0c\u56e0\u4e3a\u8fd9\u5c31\u50cf\u662f\u9605\u8bfb\u5230\u5904\u90fd\u662f\u672f\u8bed\u9ed1\u8bdd\u7684\u5916\u6587\u6587\u672c\u3002\u6240\u4ee5\u5f53\u4f60\u89c9\u5f97\u54ea\u91cc\u4e0d\u5bf9\u52b2\uff0c\u53ef\u4ee5\u53bb\u770b\u770b\u6211\u7684",(0,s.jsx)(n.a,{href:"/blog/ecma-spec",children:"\u9605\u8bfb\u89c4\u8303\u6307\u5357"}),"\u3002"]})}),"\n",(0,s.jsx)(n.h3,{id:"\u6ce8\u91ca",children:"\u6ce8\u91ca"}),"\n",(0,s.jsx)(n.p,{children:"\u6ce8\u91ca (comments) \u6ca1\u6709\u8bed\u4e49\u610f\u4e49\uff0c\u5982\u679c\u6211\u4eec\u6b63\u5728\u7f16\u5199\u8fd0\u884c\u65f6\uff0c\u90a3\u53ef\u4ee5\u8df3\u8fc7\u5b83\u4eec\uff1b\u4f46\u5982\u679c\u6211\u4eec\u6b63\u5728\u7f16\u5199\u4e00\u4e2a linter \u6216 bundler\uff0c\u90a3\u5c31\u4e0d\u53ef\u5ffd\u7565\u3002"}),"\n",(0,s.jsx)(n.h3,{id:"\u6807\u8bc6\u7b26\u548c-unicode",children:"\u6807\u8bc6\u7b26\u548c Unicode"}),"\n",(0,s.jsxs)(n.p,{children:["\u6211\u4eec\u5927\u591a\u6570\u65f6\u5019\u4f7f\u7528 ASCII \u7f16\u7801\uff0c\n\u4f46\u662f",(0,s.jsx)(n.a,{href:"https://tc39.es/ecma262/#sec-ecmascript-language-source-code",children:"\u300aECMAScript\u8bed\u8a00\u89c4\u8303: \u6e90\u4ee3\u7801\u300b\u7b2c11\u7ae0"})," \u89c4\u5b9a\u6e90\u4ee3\u7801\u5e94\u8be5\u4f7f\u7528 Unicode \u7f16\u7801\u3002\n\u800c",(0,s.jsx)(n.a,{href:"https://tc39.es/ecma262/#sec-names-and-keywords",children:"\u7b2c 12.6 \u7ae0 \u540d\u79f0\u548c\u5173\u952e\u5b57"}),"\u89c4\u5b9a\uff0c\u6807\u8bc6\u7b26 (identifier) \u7684\u89e3\u91ca\u9075\u5faa Unicode \u6807\u51c6\u9644\u5f55 31 \u4e2d\u7ed9\u51fa\u7684\u9ed8\u8ba4\u6807\u8bc6\u7b26\u8bed\u6cd5 (Default Identifier Syntax)\u3002\n\u5177\u4f53\u6765\u8bf4\uff1a"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-markup",children:"IdentifierStartChar ::\n    UnicodeIDStart\n\nIdentifierPartChar ::\n    UnicodeIDContinue\n\nUnicodeIDStart ::\n    any Unicode code point with the Unicode property \u201cID_Start\u201d\n\nUnicodeIDContinue ::\n    any Unicode code point with the Unicode property \u201cID_Continue\u201d\n"})}),"\n",(0,s.jsxs)(n.p,{children:["\u8fd9\u610f\u5473\u7740\u6211\u4eec\u53ef\u4ee5\u5199",(0,s.jsx)(n.code,{children:"var \u0ca0_\u0ca0"}),"\uff0c\u4f46\u4e0d\u80fd\u5199",(0,s.jsx)(n.code,{children:"var \ud83e\udd80"}),"\uff0c\n",(0,s.jsx)(n.code,{children:"\u0ca0"}),'\u5177\u6709Unicode\u5c5e\u6027"ID_Start"\uff0c\u800c',(0,s.jsx)(n.code,{children:"\ud83e\udd80"}),"\u5219\u6ca1\u6709\u3002"]}),"\n",(0,s.jsx)(n.admonition,{type:"info",children:(0,s.jsxs)(n.p,{children:["\u6211\u53d1\u5e03\u4e86 ",(0,s.jsx)(n.a,{href:"https://crates.io/crates/unicode-id-start",children:"unicode-id-start"})," \u8fd9\u4e2a crate\uff0c\u7528\u4e8e\u8fd9\u4e2a\u7279\u5b9a\u76ee\u7684\u3002\n\u6211\u4eec\u53ef\u4ee5\u8c03\u7528",(0,s.jsx)(n.code,{children:"unicode_id_start::is_id_start(char)"}),"\u548c",(0,s.jsx)(n.code,{children:"unicode_id_start::is_id_continue(char)"}),"\u6765\u68c0\u67e5 Unicode \u3002"]})}),"\n",(0,s.jsx)(n.h3,{id:"\u5173\u952e\u5b57",children:"\u5173\u952e\u5b57"}),"\n",(0,s.jsxs)(n.p,{children:["\u6240\u6709\u7684",(0,s.jsx)(n.a,{href:"https://tc39.es/ecma262/#sec-keywords-and-reserved-words",children:"\u5173\u952e\u5b57"})," (keywords)\uff0c\u6bd4\u5982",(0,s.jsx)(n.code,{children:"if"}),"\u3001",(0,s.jsx)(n.code,{children:"while"}),"\u548c",(0,s.jsx)(n.code,{children:"for"}),"\uff0c\n\u90fd\u9700\u8981\u89c6\u4f5c\u4e00\u4e2a\u6574\u4f53\u8fdb\u884c\u5206\u8bcd\u3002\n\u5b83\u4eec\u9700\u8981\u88ab\u6dfb\u52a0\u5230 token \u79cd\u7c7b\u7684\u679a\u4e3e\u4e2d\uff0c\u8fd9\u6837\u6211\u4eec\u5c31\u4e0d\u5fc5\u5728\u89e3\u6790\u5668\u4e2d\u8fdb\u884c\u5b57\u7b26\u4e32\u6bd4\u8f83\u4e86\u3002"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-rust",children:"pub enum Kind {\n    Identifier,\n    If,\n    While,\n    For\n}\n"})}),"\n",(0,s.jsx)(n.admonition,{type:"caution",children:(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"undefined"}),"\u4e0d\u662f\u4e00\u4e2a\u5173\u952e\u5b57\uff0c\u4e0d\u9700\u8981\u5728\u8fd9\u91cc\u6dfb\u52a0\u3002"]})}),"\n",(0,s.jsx)(n.p,{children:"\u5bf9\u5173\u952e\u5b57\u8fdb\u884c\u5206\u8bcd\u53ea\u9700\u5339\u914d\u4e0a\u8ff0\u7684\u6807\u8bc6\u7b26\u3002"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-rust",children:'fn match_keyword(&self, ident: &str) -> Kind {\n    // \u6240\u6709\u5173\u952e\u5b57\u7684\u957f\u5ea6\u90fd\u57281\u523010\u4e4b\u95f4\n    if ident.len() == 1 || ident.len() > 10 {\n        return Kind::Identifier;\n    }\n    match ident {\n        "if" => Kind::If,\n        "while" => Kind::While,\n        "for" => Kind::For,\n        _ => Kind::Identifier\n    }\n}\n'})}),"\n",(0,s.jsx)(n.h3,{id:"token-\u7684\u503c",children:"Token \u7684\u503c"}),"\n",(0,s.jsx)(n.p,{children:"\u5728\u7f16\u8bd1\u5668\u7684\u540e\u7eed\u9636\u6bb5\uff0c\u6211\u4eec\u7ecf\u5e38\u9700\u8981\u6bd4\u8f83\u6807\u8bc6\u7b26\u3001\u6570\u5b57\u548c\u5b57\u7b26\u4e32\uff0c\n\u4f8b\u5982\u5728 linter \u4e2d\u5bf9\u6807\u8bc6\u7b26\u8fdb\u884c\u6d4b\u8bd5\u3002"}),"\n",(0,s.jsx)(n.p,{children:"\u8fd9\u4e9b\u503c\u76ee\u524d\u4ee5\u6e90\u6587\u672c\u7684\u5f62\u5f0f\u5b58\u5728\u3002\u73b0\u5728\u8ba9\u6211\u4eec\u5c06\u5b83\u4eec\u8f6c\u6362\u4e3a Rust \u7c7b\u578b\uff0c\u4ee5\u4fbf\u66f4\u5bb9\u6613\u5904\u7406\u3002"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-rust",children:"pub enum Kind {\n    Eof, // \u6587\u4ef6\u7ed3\u5c3e\n    Plus,\n    // highlight-start\n    Identifier,\n    Number,\n    String,\n    // highlight-end\n}\n\n#[derive(Debug, Clone, Copy, PartialEq)]\npub struct Token {\n    /// Token \u7c7b\u578b\n    pub kind: Kind,\n\n    /// \u5728\u6e90\u7801\u4e2d\u7684\u8d77\u59cb\u504f\u79fb\u91cf\n    pub start: usize,\n\n    /// \u5728\u6e90\u7801\u4e2d\u7684\u7ed3\u675f\u504f\u79fb\u91cf\n    pub end: usize,\n\n    // highlight-next-line\n    pub value: TokenValue,\n}\n\n#[derive(Debug, Clone, PartialEq)]\npub enum TokenValue {\n    None,\n    Number(f64),\n    String(String),\n}\n"})}),"\n",(0,s.jsxs)(n.p,{children:["\u5f53\u5bf9\u6807\u8bc6\u7b26 ",(0,s.jsx)(n.code,{children:"foo"})," \u6216\u5b57\u7b26\u4e32 ",(0,s.jsx)(n.code,{children:'"bar"'})," \u8fdb\u884c\u5206\u8bcd\u65f6\uff0c\u6211\u4eec\u4f1a\u5f97\u5230:"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-markup",children:'Token { kind: Kind::Identifier, start: 0, end: 2, value: TokenValue::String("foo") }\nToken { kind: Kind::String, start: 0, end: 4, value: TokenValue::String("bar") }\n'})}),"\n",(0,s.jsxs)(n.p,{children:["\u8981\u5c06\u5b83\u4eec\u8f6c\u6362\u4e3a Rust \u5b57\u7b26\u4e32\uff0c\u5148\u8c03\u7528 ",(0,s.jsx)(n.code,{children:"let s = self.source[token.start..token.end].to_string()"}),"\uff0c\n\u7136\u540e\u7528 ",(0,s.jsx)(n.code,{children:"token.value = TokenValue::String(s)"})," \u4fdd\u5b58\u5b83\u3002"]}),"\n",(0,s.jsxs)(n.p,{children:["\u5f53\u6211\u4eec\u5206\u8bcd\u4e00\u4e2a\u6570\u5b57 ",(0,s.jsx)(n.code,{children:"1.23"})," \u65f6\uff0c\u6211\u4eec\u5f97\u5230\u4e00\u4e2a\u7c7b\u4f3c ",(0,s.jsx)(n.code,{children:"Token { start: 0, end: 3 }"})," \u7684 token\u3002\n\u8981\u5c06\u5b83\u8f6c\u6362\u4e3a Rust \u7684 ",(0,s.jsx)(n.code,{children:"f64"}),"\uff0c\u6211\u4eec\u53ef\u4ee5\u4f7f\u7528\u5b57\u7b26\u4e32\u7684 ",(0,s.jsx)(n.a,{href:"https://doc.rust-lang.org/std/primitive.str.html#method.parse",children:(0,s.jsx)(n.code,{children:"parse"})})," \u65b9\u6cd5\uff0c\n\u901a\u8fc7\u8c03\u7528 ",(0,s.jsx)(n.code,{children:"self.source[token.start..token.end].parse::<f64>()"}),"\uff0c\u7136\u540e\u5c06\u503c\u4fdd\u5b58\u5230 ",(0,s.jsx)(n.code,{children:"token.value"})," \u4e2d\u3002\n\u5bf9\u4e8e\u4e8c\u8fdb\u5236\u3001\u516b\u8fdb\u5236\u548c\u6574\u6570\uff0c\u53ef\u4ee5\u5728 ",(0,s.jsx)(n.a,{href:"https://github.com/mozilla-spidermonkey/jsparagus/blob/master/crates/parser/src/numeric_value.rs",children:"jsparagus"})," \u4e2d\u627e\u5230\u89e3\u6790\u5b83\u4eec\u7684\u65b9\u6cd5\u3002"]}),"\n",(0,s.jsx)(n.h2,{id:"rust-\u4f18\u5316",children:"Rust \u4f18\u5316"}),"\n",(0,s.jsx)(n.h3,{id:"\u66f4\u5c0f\u7684-token",children:"\u66f4\u5c0f\u7684 Token"}),"\n",(0,s.jsxs)(n.p,{children:["\u82e5\u8981\u83b7\u5f97\u66f4\u7b80\u5355\u5b89\u5168\u7684\u4ee3\u7801\uff0c\u628a token \u7684\u503c\u653e\u5728 ",(0,s.jsx)(n.code,{children:"Kind"})," \u679a\u4e3e\u7684\u5185\u90e8\u4f3c\u4e4e\u662f\u4e2a\u975e\u5e38\u8bf1\u4eba\u7684\u9009\u62e9\uff1a"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-rust",children:"pub enum Kind {\n    Number(f64),\n    String(String),\n}\n"})}),"\n",(0,s.jsxs)(n.p,{children:["\u4f17\u6240\u5468\u77e5\uff0cRust \u679a\u4e3e\u7684\u5b57\u8282\u5927\u5c0f\u662f\u5176\u6240\u6709\u53d8\u4f53\u7684\u8054\u5408 (union)\u3002\n\u76f8\u6bd4\u539f\u59cb\u679a\u4e3e\uff0c\u8fd9\u4e2a\u679a\u4e3e\u591a\u4e86\u5f88\u591a\u5b57\u8282\uff0c\u800c\u539f\u59cb\u679a\u4e3e\u53ea\u6709 1 \u4e2a\u5b57\u8282\u3002\n\u89e3\u6790\u5668\u4e2d\u5c06\u4f1a\u5927\u91cf\u4f7f\u7528 ",(0,s.jsx)(n.code,{children:"Kind"})," \u679a\u4e3e\uff0c\u5904\u7406 1 \u4e2a\u5b57\u8282\u7684\u679a\u4e3e\u663e\u7136\u6bd4\u5904\u7406\u591a\u5b57\u8282\u679a\u4e3e\u66f4\u5feb\u3002"]}),"\n",(0,s.jsx)(n.h3,{id:"string-interning",children:"String Interning"}),"\n",(0,s.jsxs)(n.p,{children:["\u5728\u7f16\u8bd1\u5668\u4e2d\u4f7f\u7528 ",(0,s.jsx)(n.code,{children:"String"})," \u6027\u80fd\u5e76\u4e0d\u9ad8\uff0c\u4e3b\u8981\u662f\u56e0\u4e3a\uff1a"]}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"String"})," \u5206\u914d\u5728\u5806\u4e0a"]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"String"}),"\u7684\u6bd4\u8f83\u662f\u4e00\u4e2a O(n) \u7684\u64cd\u4f5c"]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"https://en.wikipedia.org/wiki/String_interning",children:"String Interning"})," \u901a\u8fc7\u5728\u7f13\u5b58\u4e2d\u53ea\u5b58\u50a8\u6bcf\u4e2a\u4e0d\u540c\u5b57\u7b26\u4e32\u503c\u7684\u4e00\u4e2a\u526f\u672c\u53ca\u5176\u552f\u4e00\u6807\u8bc6\u4ee5\u89e3\u51b3\u8fd9\u4e9b\u95ee\u9898\u3002\n\u6bcf\u4e2a\u4e0d\u540c\u6807\u8bc6\u7b26\u6216\u5b57\u7b26\u4e32\u5c06\u53ea\u6709\u4e00\u6b21\u5806\u5206\u914d\uff0c\u5e76\u4e14\u5b57\u7b26\u4e32\u6bd4\u8f83\u53d8\u4e3a O(1)\u3002"]}),"\n",(0,s.jsxs)(n.p,{children:["\u5728 ",(0,s.jsx)(n.a,{href:"https://crates.io/search?q=string%20interning",children:"crates.io"})," \u4e0a\u6709\u8bb8\u591a string interning \u5e93\uff0c\u5177\u6709\u4e0d\u540c\u7684\u4f18\u7f3a\u70b9\u3002"]}),"\n",(0,s.jsxs)(n.p,{children:["\u5728\u6700\u5f00\u59cb\uff0c\u6211\u4eec\u4f7f\u7528",(0,s.jsx)(n.a,{href:"https://crates.io/crates/string_cache",children:(0,s.jsx)(n.code,{children:"string-cache"})}),"\u4fbf\u5df2\u591f\u7528\uff0c\u5b83\u6709\u4e00\u4e2a ",(0,s.jsx)(n.code,{children:"Atom"})," \u7c7b\u578b\u548c\u4e00\u4e2a\u7f16\u8bd1\u65f6\u7684 ",(0,s.jsx)(n.code,{children:'atom!("string")'})," \u63a5\u53e3\u3002"]}),"\n",(0,s.jsxs)(n.p,{children:["\u4f7f\u7528 ",(0,s.jsx)(n.code,{children:"string-cache"})," \u540e\uff0c",(0,s.jsx)(n.code,{children:"TokenValue"})," \u9700\u6539\u4e3a\uff1a"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-rust",children:"#[derive(Debug, Clone, PartialEq)]\npub enum TokenValue {\n    None,\n    Number(f64),\n    // highlight-next-line\n    String(Atom),\n}\n"})}),"\n",(0,s.jsxs)(n.p,{children:["\u5b57\u7b26\u4e32\u6bd4\u8f83\u5219\u53d8\u4e3a ",(0,s.jsx)(n.code,{children:'matches!(value, TokenValue::String(atom!("string")))'}),"\u3002"]})]})}function h(e={}){const{wrapper:n}={...(0,i.a)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(o,{...e})}):o(e)}},7660:(e,n,r)=>{r.d(n,{Z:()=>t,a:()=>d});var s=r(959);const i={},c=s.createContext(i);function d(e){const n=s.useContext(c);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function t(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:d(e.components),s.createElement(c.Provider,{value:n},e.children)}}}]);