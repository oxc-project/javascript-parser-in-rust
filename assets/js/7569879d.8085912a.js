"use strict";(self.webpackChunkjavascript_compiler_in_rust=self.webpackChunkjavascript_compiler_in_rust||[]).push([[618],{9613:(e,t,a)=>{a.d(t,{Zo:()=>c,kt:()=>u});var n=a(9496);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function o(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function i(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?o(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):o(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function m(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},o=Object.keys(e);for(n=0;n<o.length;n++)a=o[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)a=o[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var s=n.createContext({}),p=function(e){var t=n.useContext(s),a=t;return e&&(a="function"==typeof e?e(t):i(i({},t),e)),a},c=function(e){var t=p(e.components);return n.createElement(s.Provider,{value:t},e.children)},l={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,o=e.originalType,s=e.parentName,c=m(e,["components","mdxType","originalType","parentName"]),d=p(a),u=r,g=d["".concat(s,".").concat(u)]||d[u]||l[u]||o;return a?n.createElement(g,i(i({ref:t},c),{},{components:a})):n.createElement(g,i({ref:t},c))}));function u(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=a.length,i=new Array(o);i[0]=d;var m={};for(var s in t)hasOwnProperty.call(t,s)&&(m[s]=t[s]);m.originalType=e,m.mdxType="string"==typeof e?e:r,i[1]=m;for(var p=2;p<o;p++)i[p]=a[p];return n.createElement.apply(null,i)}return n.createElement.apply(null,a)}d.displayName="MDXCreateElement"},7173:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>s,contentTitle:()=>i,default:()=>l,frontMatter:()=>o,metadata:()=>m,toc:()=>p});var n=a(2081),r=(a(9496),a(9613));const o={title:"Grammar"},i=void 0,m={permalink:"/javascript-compiler-in-rust/blog/grammar",editUrl:"https://github.com/Boshen/javascript-compiler-in-rust/tree/main/blog/blog/grammar.md",source:"@site/blog/grammar.md",title:"Grammar",description:"LL(1) Grammar",date:"2022-08-11T15:53:32.000Z",formattedDate:"August 11, 2022",tags:[],readingTime:2.235,hasTruncateMarker:!1,authors:[],frontMatter:{title:"Grammar"},prevItem:{title:"The ECMAScript Specification",permalink:"/javascript-compiler-in-rust/blog/ecma-spec"}},s={authorsImageUrls:[]},p=[{value:"LL(1) Grammar",id:"ll1-grammar",level:2}],c={toc:p};function l(e){let{components:t,...a}=e;return(0,r.kt)("wrapper",(0,n.Z)({},c,a,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h2",{id:"ll1-grammar"},"LL(1) Grammar"),(0,r.kt)("p",null,"According to wikipedia,"),(0,r.kt)("blockquote",null,(0,r.kt)("p",{parentName:"blockquote"},"an LL grammar is a context-free grammar that can be parsed by an LL parser, which parses the input from Left to right")),(0,r.kt)("p",null,"The first ",(0,r.kt)("strong",{parentName:"p"},"L")," means the scanning the source from ",(0,r.kt)("strong",{parentName:"p"},"L"),"eft to right,\nand the second ",(0,r.kt)("strong",{parentName:"p"},"L")," means the construction of a ",(0,r.kt)("strong",{parentName:"p"},"L"),"eftmost derivation tree."),(0,r.kt)("p",null,"Context-free and the (1) in LL(1) means a tree can be constructed by just peeking at the next token and nothing else."),(0,r.kt)("p",null,"LL Grammars are of particular interest in academia because we are lazy human beings and we want to write programs that generate parsers automatically so we don't need to write parsers by hand."),(0,r.kt)("p",null,"Unfortunately most industrial programming languages do not have a nice LL(1) grammar,\nand this applies to JavaScript too."),(0,r.kt)("admonition",{type:"info"},(0,r.kt)("p",{parentName:"admonition"},"Mozilla started the ",(0,r.kt)("a",{parentName:"p",href:"https://github.com/mozilla-spidermonkey/jsparagus"},"jsparagus")," project a few years ago,\nand wrote a ",(0,r.kt)("a",{parentName:"p",href:"https://github.com/mozilla-spidermonkey/jsparagus/tree/master/jsparagus"},"LALR parser generator in Python"),".\nThey haven't updated it much in the past two years and they sent a strong message at the end of ",(0,r.kt)("a",{parentName:"p",href:"https://github.com/mozilla-spidermonkey/jsparagus/blob/master/js-quirks.md"},"js-quirks.md")),(0,r.kt)("blockquote",{parentName:"admonition"},(0,r.kt)("p",{parentName:"blockquote"},"What have we learned today?"),(0,r.kt)("ul",{parentName:"blockquote"},(0,r.kt)("li",{parentName:"ul"},"Do not write a JS parser."),(0,r.kt)("li",{parentName:"ul"},"JavaScript has some syntactic horrors in it. But hey, you don't make the world's most widely used programming language by avoiding all mistakes. You do it by shipping a serviceable tool, in the right circumstances, for the right users.\n:::"))),(0,r.kt)("hr",{parentName:"admonition"}),(0,r.kt)("p",{parentName:"admonition"},"What we have learned so far is that a JavaScript parser can only be written by hand,\nso let's learn all the quirks in the grammar before we shoot ourselves in the foot."),(0,r.kt)("p",{parentName:"admonition"},"The list below starts simple and will become difficult to grasp,\nso please take your time."),(0,r.kt)("h2",{parentName:"admonition",id:"class-and-strict-mode"},"Class and strict mode"),(0,r.kt)("p",{parentName:"admonition"},"class is strict, but there is not scope ..."),(0,r.kt)("h2",{parentName:"admonition",id:"legacy-octal-and-use-strict"},"Legacy Octal and Use Strict"),(0,r.kt)("pre",{parentName:"admonition"},(0,r.kt)("code",{parentName:"pre"},"'\\01'\n'use strict';\n")),(0,r.kt)("p",{parentName:"admonition"},"is syntax error"),(0,r.kt)("h2",{parentName:"admonition",id:"es2016-non-simple-parameter-argument-and-strict-mode"},"ES2016 non-simple parameter argument and strict mode"),(0,r.kt)("pre",{parentName:"admonition"},(0,r.kt)("code",{parentName:"pre"},"function foo({a}) {\n    'use strict';\n}\n")),(0,r.kt)("p",{parentName:"admonition"},"is syntax error"),(0,r.kt)("p",{parentName:"admonition"},"but ... if you are writing a transpiler, e.g. TypeScript, this is not syntax if you are targeting es5."),(0,r.kt)("h2",{parentName:"admonition",id:"functiondeclarations-in-ifstatement-statement-clauses"},"FunctionDeclarations in IfStatement Statement Clauses"),(0,r.kt)("p",{parentName:"admonition"},(0,r.kt)("a",{parentName:"p",href:"https://tc39.es/ecma262/#sec-functiondeclarations-in-ifstatement-statement-clauses"},"B.3.3 FunctionDeclarations in IfStatement Statement Clauses")),(0,r.kt)("p",{parentName:"admonition"},"we need FunctionDeclarations in Statement ..."),(0,r.kt)("h3",{parentName:"admonition",id:"label-statement-is-legit"},"Label statement is legit"),(0,r.kt)("pre",{parentName:"admonition"},(0,r.kt)("code",{parentName:"pre"},"const foo => { foo: bar }\n")),(0,r.kt)("p",{parentName:"admonition"},"is legit"),(0,r.kt)("h2",{parentName:"admonition",id:"let-is-not-a-keyword"},(0,r.kt)("inlineCode",{parentName:"h2"},"let")," is not a keyword"),(0,r.kt)("p",{parentName:"admonition"},"you need about a dozen checks to make sure you are on a let declaration ..."),(0,r.kt)("h2",{parentName:"admonition",id:"for-of"},"For-of"),(0,r.kt)("p",{parentName:"admonition"},(0,r.kt)("inlineCode",{parentName:"p"},"for (let in ...)"),"\n",(0,r.kt)("inlineCode",{parentName:"p"},"for (async of ..)")),(0,r.kt)("h3",{parentName:"admonition",id:"b32-block-level-function-declarations-web-legacy-compatibility-semantics"},"B.3.2 Block-Level Function Declarations Web Legacy Compatibility Semantics"),(0,r.kt)("p",{parentName:"admonition"},(0,r.kt)("a",{parentName:"p",href:"https://tc39.es/ecma262/#sec-block-level-function-declarations-web-legacy-compatibility-semantics"},"https://tc39.es/ecma262/#sec-block-level-function-declarations-web-legacy-compatibility-semantics")),(0,r.kt)("h2",{parentName:"admonition",id:"ambiguous-grammar"},"Ambiguous Grammar"),(0,r.kt)("p",{parentName:"admonition"},(0,r.kt)("inlineCode",{parentName:"p"},"/")," slash and ",(0,r.kt)("inlineCode",{parentName:"p"},"/=")," regex"),(0,r.kt)("h2",{parentName:"admonition",id:"grammar-context"},"Grammar Context"),(0,r.kt)("p",{parentName:"admonition"},"yield ... await ..."),(0,r.kt)("h2",{parentName:"admonition",id:"cover-grammar"},"Cover Grammar"),(0,r.kt)("h3",{parentName:"admonition",id:"arrow-functions"},"Arrow functions"),(0,r.kt)("h3",{parentName:"admonition",id:"object-patter-vs-object-binding"},"Object Patter vs Object binding"),(0,r.kt)("h3",{parentName:"admonition",id:"assignment-target-pattern"},"Assignment target pattern")))}l.isMDXComponent=!0}}]);