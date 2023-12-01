"use strict";(self.webpackChunkjavascript_parser_in_rust=self.webpackChunkjavascript_parser_in_rust||[]).push([[615],{6594:(e,n,r)=>{r.r(n),r.d(n,{assets:()=>c,contentTitle:()=>a,default:()=>l,frontMatter:()=>s,metadata:()=>o,toc:()=>d});var t=r(1527),i=r(7660);const s={id:"typescript",title:"TypeScript"},a=void 0,o={id:"typescript",title:"TypeScript",description:"\u6240\u4ee5\u4f60\u5df2\u7ecf\u5b8c\u6210\u4e86JavaScript\uff0c\u73b0\u5728\u60f3\u8981\u6311\u6218\u89e3\u6790TypeScript\u4e86\uff1f\u574f\u6d88\u606f\u662f\u6ca1\u6709\u89c4\u8303\uff0c\u4f46\u597d\u6d88\u606f\u662fTypeScript\u89e3\u6790\u5668\u5728\u4e00\u4e2a\u5355\u4e00\u6587\u4ef6\u4e2d \ud83d\ude43\u3002",source:"@site/i18n/zh/docusaurus-plugin-content-docs/current/typescript.md",sourceDirName:".",slug:"/typescript",permalink:"/javascript-parser-in-rust/zh/docs/typescript",draft:!1,unlisted:!1,editUrl:"https://github.com/oxc-project/javascript-parser-in-rust/tree/main/docs/typescript.md",tags:[],version:"current",frontMatter:{id:"typescript",title:"TypeScript"},sidebar:"tutorialSidebar",previous:{title:"\u8bed\u4e49\u5206\u6790 (Semantic Analysis)",permalink:"/javascript-parser-in-rust/zh/docs/semantics_analysis"},next:{title:"\u53c2\u8003\u6587\u732e",permalink:"/javascript-parser-in-rust/zh/docs/references"}},c={},d=[{value:"JSX vs TSX",id:"jsx-vs-tsx",level:2},{value:"\u524d\u5411\u67e5\u627e (lookahead)",id:"\u524d\u5411\u67e5\u627e-lookahead",level:2},{value:"TSIndexSignature",id:"tsindexsignature",level:3},{value:"\u7bad\u5934\u8868\u8fbe\u5f0f",id:"\u7bad\u5934\u8868\u8fbe\u5f0f",level:3}];function p(e){const n={a:"a",code:"code",h2:"h2",h3:"h3",p:"p",pre:"pre",...(0,i.a)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(n.p,{children:["\u6240\u4ee5\u4f60\u5df2\u7ecf\u5b8c\u6210\u4e86JavaScript\uff0c\u73b0\u5728\u60f3\u8981\u6311\u6218\u89e3\u6790TypeScript\u4e86\uff1f\u574f\u6d88\u606f\u662f\u6ca1\u6709\u89c4\u8303\uff0c\u4f46\u597d\u6d88\u606f\u662fTypeScript\u89e3\u6790\u5668\u5728",(0,t.jsx)(n.a,{href:"https://github.com/microsoft/TypeScript/blob/main/src/compiler/parser.ts",children:"\u4e00\u4e2a\u5355\u4e00\u6587\u4ef6"}),"\u4e2d \ud83d\ude43\u3002"]}),"\n",(0,t.jsx)(n.h2,{id:"jsx-vs-tsx",children:"JSX vs TSX"}),"\n",(0,t.jsx)(n.p,{children:"\u5bf9\u4e8e\u4ee5\u4e0b\u4ee3\u7801\uff0c"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-javascript",children:"let foo = <string> bar;\n"})}),"\n",(0,t.jsxs)(n.p,{children:["\u5982\u679c\u8fd9\u662f",(0,t.jsx)(n.code,{children:"tsx"}),"\uff0c\u90a3\u4e48\u8fd9\u662f\u4e00\u4e2a\u8bed\u6cd5\u9519\u8bef\uff08\u672a\u7ec8\u6b62\u7684JSX\uff09\uff0c\u4f46\u5982\u679c\u662f",(0,t.jsx)(n.code,{children:"VariableDeclaration"}),"\u548c",(0,t.jsx)(n.code,{children:"TSTypeAssertion"}),"\uff0c\u90a3\u4e48\u8fd9\u662f\u6b63\u786e\u7684\u3002"]}),"\n",(0,t.jsx)(n.h2,{id:"\u524d\u5411\u67e5\u627e-lookahead",children:"\u524d\u5411\u67e5\u627e (lookahead)"}),"\n",(0,t.jsx)(n.p,{children:"\u5728\u67d0\u4e9b\u5730\u65b9\uff0c\u89e3\u6790\u5668\u9700\u8981\u5411\u524d\u67e5\u627e\u5e76\u67e5\u770b\u591a\u4e2a token \u4ee5\u51b3\u5b9a\u6b63\u786e\u7684\u8bed\u6cd5\u3002"}),"\n",(0,t.jsx)(n.h3,{id:"tsindexsignature",children:"TSIndexSignature"}),"\n",(0,t.jsxs)(n.p,{children:["\u4f8b\u5982\uff0c\u4e3a\u4e86\u89e3\u6790",(0,t.jsx)(n.code,{children:"TSIndexSignature"}),"\uff0c\u8003\u8651\u4ee5\u4e0b\u4e24\u79cd\u60c5\u51b5\uff1a"]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-typescript",children:"type A = { readonly [a: number]: string }\n           ^__________________________^ TSIndexSignature\n\ntype B = { [a]: string }\n           ^_________^ TSPropertySignature\n"})}),"\n",(0,t.jsxs)(n.p,{children:["\u5bf9\u4e8e\u7b2c\u4e00\u4e2a",(0,t.jsx)(n.code,{children:"type A"}),"\u4e2d\u7684",(0,t.jsx)(n.code,{children:"{"}),"\uff0c\u6211\u4eec\u9700\u8981\u5411\u524d\u67e5\u770b5\u4e2a token \uff08",(0,t.jsx)(n.code,{children:"readonly"}),"\u3001",(0,t.jsx)(n.code,{children:"["}),"\u3001",(0,t.jsx)(n.code,{children:"a"}),"\u3001",(0,t.jsx)(n.code,{children:":"})," \u548c ",(0,t.jsx)(n.code,{children:"number"}),"\uff09\u4ee5\u786e\u4fdd\u5b83\u662f",(0,t.jsx)(n.code,{children:"TSIndexSignature"}),"\u800c\u4e0d\u662f",(0,t.jsx)(n.code,{children:"TSPropertySignature"}),"\u3002"]}),"\n",(0,t.jsx)(n.p,{children:"\u4e3a\u4e86\u5b9e\u73b0\u8fd9\u4e00\u70b9\u5e76\u63d0\u9ad8\u6548\u7387\uff0c\u8bcd\u6cd5\u5206\u6790\u5668\u9700\u8981\u4e00\u4e2a\u7f13\u51b2\u533a\u6765\u5b58\u50a8\u591a\u4e2a token \u3002"}),"\n",(0,t.jsx)(n.h3,{id:"\u7bad\u5934\u8868\u8fbe\u5f0f",children:"\u7bad\u5934\u8868\u8fbe\u5f0f"}),"\n",(0,t.jsxs)(n.p,{children:["\u5728",(0,t.jsx)(n.a,{href:"/blog/grammar#cover-grammar",children:"cover grammar"}),"\u4e2d\u8ba8\u8bba\u8fc7\uff0c\u5f53\u5728 SequenceExpression \u540e\u9762\u627e\u5230",(0,t.jsx)(n.code,{children:"=>"})," token \u65f6\uff0c\u6211\u4eec\u9700\u8981\u5c06",(0,t.jsx)(n.code,{children:"Expression"}),"\u8f6c\u6362\u4e3a",(0,t.jsx)(n.code,{children:"BindingPattern"}),"\u3002"]}),"\n",(0,t.jsxs)(n.p,{children:["\u4f46\u662f\u5bf9\u4e8eTypeScript\u6765\u8bf4\uff0c\u8fd9\u79cd\u65b9\u6cd5\u4e0d\u9002\u7528\uff0c\u56e0\u4e3a",(0,t.jsx)(n.code,{children:"()"}),"\u4e2d\u7684\u6bcf\u4e2a\u9879\u76ee\u90fd\u53ef\u80fd\u6709TypeScript\u8bed\u6cd5\uff0c\u6709\u592a\u591a\u60c5\u51b5\u9700\u8981\u8003\u8651\uff0c\u4f8b\u5982\uff1a"]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-typescript",children:"<x>a, b as c, d!;\n(a?: b = {} as c!) => {};\n"})}),"\n",(0,t.jsx)(n.p,{children:"\u5efa\u8bae\u7814\u7a76TypeScript\u6e90\u4ee3\u7801\u6765\u5904\u7406\u8fd9\u4e2a\u95ee\u9898\u3002\u76f8\u5173\u4ee3\u7801\u5982\u4e0b\uff1a"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-typescript",children:"function tryParseParenthesizedArrowFunctionExpression(\n  allowReturnTypeInArrowFunction: boolean,\n): Expression | undefined {\n  const triState = isParenthesizedArrowFunctionExpression();\n  if (triState === Tristate.False) {\n    // It's definitely not a parenthesized arrow function expression.\n    return undefined;\n  }\n\n  // If we definitely have an arrow function, then we can just parse one, not requiring a\n  // following => or { token. Otherwise, we *might* have an arrow function.  Try to parse\n  // it out, but don't allow any ambiguity, and return 'undefined' if this could be an\n  // expression instead.\n  return triState === Tristate.True\n    ? parseParenthesizedArrowFunctionExpression(\n        /*allowAmbiguity*/ true,\n        /*allowReturnTypeInArrowFunction*/ true,\n      )\n    : tryParse(() =>\n        parsePossibleParenthesizedArrowFunctionExpression(\n          allowReturnTypeInArrowFunction,\n        ),\n      );\n}\n\n//  True        -> We definitely expect a parenthesized arrow function here.\n//  False       -> There *cannot* be a parenthesized arrow function here.\n//  Unknown     -> There *might* be a parenthesized arrow function here.\n//                 Speculatively look ahead to be sure, and rollback if not.\nfunction isParenthesizedArrowFunctionExpression(): Tristate {\n  if (\n    token() === SyntaxKind.OpenParenToken ||\n    token() === SyntaxKind.LessThanToken ||\n    token() === SyntaxKind.AsyncKeyword\n  ) {\n    return lookAhead(isParenthesizedArrowFunctionExpressionWorker);\n  }\n\n  if (token() === SyntaxKind.EqualsGreaterThanToken) {\n    // ERROR RECOVERY TWEAK:\n    // If we see a standalone => try to parse it as an arrow function expression as that's\n    // likely what the user intended to write.\n    return Tristate.True;\n  }\n  // Definitely not a parenthesized arrow function.\n  return Tristate.False;\n}\n"})}),"\n",(0,t.jsx)(n.p,{children:"\u603b\u4e4b\uff0cTypeScript\u89e3\u6790\u5668\u7ed3\u5408\u4e86\u5148\u884c\u67e5\u627e\uff08\u5feb\u901f\u8def\u5f84\uff09\u548c\u56de\u6eaf\u6765\u89e3\u6790\u7bad\u5934\u51fd\u6570\u3002"})]})}function l(e={}){const{wrapper:n}={...(0,i.a)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(p,{...e})}):p(e)}},7660:(e,n,r)=>{r.d(n,{Z:()=>o,a:()=>a});var t=r(959);const i={},s=t.createContext(i);function a(e){const n=t.useContext(s);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:a(e.components),t.createElement(s.Provider,{value:n},e.children)}}}]);