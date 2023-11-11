---
id: parser
title: Parser
---

우리가 만들 파서를 [recursive descent parser](https://en.wikipedia.org/wiki/Recursive_descent_parser)라고 합니다,
이는 문법을 따라 AST를 구축하는 수동 프로세스입니다.

파서는 단순하게 시작하며, 소스코드, lexer, lexer에서 소비될 토큰을 갖습니다.

```rust
pub struct Parser<'a> {
    /// Source Code
    source: &'a str,

    lexer: Lexer<'a>,

    /// Current Token consumed from the lexer
    cur_token: Token,

    /// The end range of the previous token
    prev_token_end: usize,
}

impl<'a> Parser<'a> {
    pub fn new(source: &'a str) -> Self {
        Self {
            source,
            lexer: Lexer::new(source),
            cur_token: Token::default(),
        }
    }

    pub fn parse(&mut self) -> Program<'a> {
        Ok(Program {
            node: Node {
                start: 0,
                end: self.source.len(),
            }
            body: vec![]
        })
    }
}
```

## Helper functions

현재 토큰 `cur_token: Token`은 lexer에서 반환된 현재 토큰을 보유합니다.
이 토큰을 탐색하고 검사하기 위한 몇 가지 헬퍼 함수를 추가하여 구문 분석기 코드를 더 깔끔하게 만들겠습니다.

```rust
impl<'a> Parser<'a> {
    fn start_node(&self) -> Node {
        let token = self.cur_token();
        Node::new(token.start, 0)
    }

    fn finish_node(&self, node: Node) -> Node {
        Node::new(node.start, self.prev_token_end)
    }

    fn cur_token(&self) -> &Token {
        &self.cur_token
    }

    fn cur_kind(&self) -> Kind {
        self.cur_token.kind
    }

    /// Checks if the current index has token `Kind`
    fn at(&self, kind: Kind) -> bool {
        self.cur_kind() == kind
    }

    /// Advance if we are at `Kind`
    fn bump(&mut self, kind: Kind) {
        if self.at(kind) {
            self.advance();
        }
    }

    /// Advance any token
    fn bump_any(&mut self) {
        self.advance();
    }

    /// Advance and return true if we are at `Kind`, return false otherwise
    fn eat(&mut self, kind: Kind) -> bool {
        if self.at(kind) {
            self.advance();
            return true;
        }
        false
    }

    /// Move to the next token
    fn advance(&mut self) {
        let token = self.lexer.next_token();
        self.prev_token_end = self.cur_token.end;
        self.cur_token = token;
    }
}
```

## Parse Functions

`DebuggerStatement`는 파싱하기 위한 가장 단순한 statement이므로, 이를 파싱해서 유효한 프로그램을 반환해봅시다.

```rust
impl<'a> Parser<'a> {
    pub fn parse(&mut self) -> Program {
        let stmt = self.parse_debugger_statement();
        let body = vec![stmt];
        Program {
            node: Node {
                start: 0,
                end: self.source.len(),
            }
            body,
        }
    }

    fn parse_debugger_statement(&mut self) -> Statement {
        let node = self.start_node();
        // NOTE: the token returned from the lexer is `Kind::Debugger`, we'll fix this later.
        self.bump_any();
        Statement::DebuggerStatement {
            node: self.finish_node(node),
        }
    }
}
```

다른 모든 파싱 함수는 이러한 기본 헬퍼 함수를 기반으로 합니다,
예를 들어 swc에서 `while` 문을 파싱합니다:

```rust reference
https://github.com/swc-project/swc/blob/554b459e26b24202f66c3c58a110b3f26bbd13cd/crates/swc_ecma_parser/src/parser/stmt.rs#L952-L970
```

## Parsing Expressions

표현식 문법은 깊게 중첩되고 재귀적입니다,
따라서 긴 표현식에서는 스택 오버플로가 발생할 수 있습니다(예: [타입스크립트 테스트](https://github.com/microsoft/TypeScript/blob/main/tests/cases/compiler/binderBinaryExpressionStressJs.ts)),

재귀를 피하기 위해 "Pratt Parsing"이라는 기술을 사용할 수 있습니다. 더 자세한 튜토리얼은 [여기](https://matklad.github.io/2020/04/13/simple-but-powerful-pratt-parsing.html)에서 Rust-Analyzer 작성자가 작성한 튜토리얼을 확인할 수 있습니다.
그리고 여기 [Rome](https://github.com/rome/tools/blob/5a059c0413baf1d54436ac0c149a829f0dfd1f4d/crates/rome_js_parser/src/syntax/expr.rs#L442)의 Rust 버전도 있습니다.

## Lists

문장 부호로 구분된 목록을 파싱해야 하는 경우가 많이 있습니다(예: `[a, b, c]` 또는 `{a, b, c}`).

목록을 파싱하는 코드는 모두 비슷하므로 [template method pattern](https://en.wikipedia.org/wiki/Template_method_pattern)을 사용하여 중복을 피할 수 있습니다.

```rust reference
https://github.com/rome/tools/blob/85ddb4b2c622cac9638d5230dcefb6cf571677f8/crates/rome_js_parser/src/parser/parse_lists.rs#L131-L157
```

이 패턴은 무한 루프, 특히 `progress.assert_progressing(p);`를 방지할 수도 있습니다.

그런 다음 다른 목록에 대해 구현 세부 정보를 제공할 수 있습니다:

```rust reference
https://github.com/rome/tools/blob/85ddb4b2c622cac9638d5230dcefb6cf571677f8/crates/rome_js_parser/src/syntax/expr.rs#L1543-L1580
```

## Cover Grammar

[cover grammar](/blog/grammar#cover-grammar)에 자세히 설명되어 있지만, `Expression`을 `BindingIdentifier``로 변환해야 할 때가 있습니다. JavaScript와 같은 동적 언어는 노드 타입을 간단히 다시 작성할 수 있습니다:

```javascript reference
https://github.com/acornjs/acorn/blob/11735729c4ebe590e406f952059813f250a4cbd1/acorn/src/lval.js#L11-L26
```

하지만 Rust에서는 구조체에서 구조체로 변환을 수행해야 합니다. 이를 위한 깔끔하고 좋은 방법은 trait을 사용하는 것입니다.

```rust
pub trait CoverGrammar<'a, T>: Sized {
    fn cover(value: T, p: &mut Parser<'a>) -> Result<Self>;
}
```

이 특성은 입력 타입으로 `T`와 출력 타입으로 `Self`를 허용하므로 다음과 같이 정의할 수 있습니다:

```rust
impl<'a> CoverGrammar<'a, Expression<'a>> for BindingPattern<'a> {
    fn cover(expr: Expression<'a>, p: &mut Parser<'a>) -> Result<Self> {
        match expr {
            Expression::Identifier(ident) => Self::cover(ident.unbox(), p),
            Expression::ObjectExpression(expr) => Self::cover(expr.unbox(), p),
            Expression::ArrayExpression(expr) => Self::cover(expr.unbox(), p),
            _ => Err(()),
        }
    }
}

impl<'a> CoverGrammar<'a, ObjectExpression<'a>> for BindingPattern<'a> {
    fn cover(obj_expr: ObjectExpression<'a>, p: &mut Parser<'a>) -> Result<Self> {
        ...
        BindingIdentifier::ObjectPattern(ObjectPattern { .. })
    }
}

impl<'a> CoverGrammar<'a, ArrayExpression<'a>> for BindingPattern<'a> {
    fn cover(expr: ArrayExpression<'a>, p: &mut Parser<'a>) -> Result<Self> {
        ...
        BindingIdentifier::ArrayPattern(ArrayPattern { .. })
    }
}
```

그런 다음 어디에서나 `Expression`을 `BindingPattern`으로 변환해야 합니다,
`BindingPattern::cover(expression)`를 호출해서요.