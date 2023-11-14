---
title: ECMAScript 사양서
---

[The ECMAScript® 2023 Language Specification](https://tc39.es/ecma262/)는 자바스크립트에 대한 모든 것을 자세히 설명하므로 누구나 자바스크립트를 구현할 수 있습니다.

<!--truncate-->

구문 분석기를 위해 다음 챕터를 따라 공부해야 합니다
The following chapters need to be studied for our parser:

- Chapter 5: Notational Conventions(표기법 규칙)
- Chapter 11: ECMAScript Language: Source Text(소스 텍스트)
- Chapter 12: ECMAScript Language: Lexical Grammar(어휘 문법)
- Chapter 13 - 16: Expressions, Statements, Functions, Classes, Scripts and Modules(표현식, 문법, 함수, 클래스, 스크립트와 모듈)
- Annex B: Additional ECMAScript Features for Web Browsers(웹 브라우저를 위한 추가 ECMAScript 기능)
- Annex C: The Strict Mode of ECMAScript(ECMAScript 엄격 모드)

사양 내 탐색:

- 클릭 가능한 모든 항목에는 링크가 있으며 URL에 앵커로 표기됩니다 예시 `#sec-identifiers`
- 항목 위로 마우스를 올리면 툴팁이 표시되고, `참조`를 클릭하면 모든 참조가 표시됩니다.

## Notational Conventions(표기법 규칙)

[Chapter 5.1.5 Grammar Notation](https://tc39.es/ecma262/#sec-grammar-notation) 우리가 읽을 섹션입니다.

여기서 유이해야할 것은 이렇습니다:

### 재귀

이하는 문법에서 목록이 표기되는 방법입니다.

```markup
ArgumentList :
  AssignmentExpression
  ArgumentList , AssignmentExpression
```

뜻

```javascript
a, b = 1, c = 2
^_____________^ ArgumentList
   ^__________^ ArgumentList, AssignmentExpression,
          ^___^ AssignmentExpression
```

### 옵션

선택적 구문을 위한 `_opt_` 접미사

이하는 예시입니다.

```markup
VariableDeclaration :
  BindingIdentifier Initializer_opt
```

뜻

```javascript
var binding_identifier;
var binding_identifier = Initializer;
                       ______________ Initializer_opt
```

### 파라메터

`[Return]`과 `[In]` 파타메터 문법입니다..

이하는 예시입니다.

```markdup
ScriptBody :
    StatementList[~Yield, ~Await, ~Return]
```

뜻 
top-level yield, await와 reutrn 허용하지 않는 스크립트

```markdup
ModuleItem :
  ImportDeclaration
  ExportDeclaration
  StatementListItem[~Yield, +Await, ~Return]
```

top-level await은 허용 됨.

## 소스 텍스트

[Chapter 11.2 Types of Source Code](https://tc39.es/ecma262/#sec-types-of-source-code) 에서는 이런 설명이 있습니다.
스크립트 코드와 모듈 코드 사이에는 큰 차이가 있다. 그리고 오래된 자바스크립트 동작을 허용하지 않음으로 문법을 더욱 엄격히 만드는 `use strict`이 있다.

**Script Code** 엄격하지 않으며, `use strict`를 파일 상단에 입력해야 엄격해집니다..
html 에서는 `<script src="javascript.js"></script>` 이렇게 작성합니다.

**Module Code** 자동으로 엄격모드입니다.
html에서는 `<script type="module" src="main.mjs"></script>` 이렇게 작성합니다.

## ECMAScript Language: Lexical Grammar(어휘 문법)

상세한 사양은 V8 블로그 [Understanding the ECMAScript spec](https://v8.dev/blog/understanding-ecmascript-part-3) 참조해주세요.

### [Automatic Semicolon Insertion](https://tc39.es/ecma262/#sec-automatic-semicolon-insertion)

이 섹션에서는 자바스크립트 작성할 때 세미콜론을 생략할 수 있는 모든 규칙에 대해 설명합니다.
모든 설명은 이하와 같이 요약됩니다.

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

문법 끝이라면 `asi` 함수를 수동으로 호출해야 합니다:

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

asi 섹션은 파서를 염두해 작성되었습니다.
소스 텍스트가 왼쪽에서 오른쪽으로 구문 분석된다 명시되어 있으며, 따라서 다른 방식으로 파서를 작성하지 않습니다.
jsparagus는 이에 대해 [언급](https://github.com/mozilla-spidermonkey/jsparagus/blob/master/js-quirks.md#automatic-semicolon-insertion-)했습니다.

> 이 기능에 대한 사양은 매우 매우 높은 레벨이면서 괴상하게도 절차적입니다("소스 텍스트가 왼쪽에서 오른쪽으로 구문 분석될 때 토큰이 발생하면...", 마치 브라우저 사양에 대한 이야기로 들립니다. 제가 아는 한 구문 분석의 내부 구현 세부 사항에 대해 가정하거나 암시하는 것은 이 부분이 유일합니다.) 하지만 다른 방식으로 asi를 지정하는 것은 어려울 것입니다.

:::

## Expressions, Statements, Functions, Classes, Scripts and Modules(표현식, 문법, 함수, 클래스, 스크립트와 모듈)

구문 문법을 이해한 다음 구문 분석기를 작성하는 데 적용하려면 시간이 필요합니다.
보다 심층적 내용은 More in-depth content can be found in [문법 튜토리얼](./grammar.md)에서 확인해주세요.

## Annex B
