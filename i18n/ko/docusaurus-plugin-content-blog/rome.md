---
title: Rome Tools
---

Rome은, JavaScript와 TypeScript 파서의 여러 기술을 사용합니다. 이 튜토리얼은 이를 이해하기 쉽게 순서를 요약합니다.

<!--truncate-->

## 역사

- Rome 코드 기반은 TypeScript에서 Rust로 재작성되었습니다. 상세한 내용은 [Rome will be rewritten in Rust](https://web.archive.org/web/20230401084626/https://rome.tools/blog/2021/09/21/rome-will-be-rewritten-in-rust/) 를 통해 확인 가능합니다.
- 이 결정은, [rslint](https://github.com/rslint/rslint)와 [rust-analyzer](https://github.com/rust-lang/rust-analyzer) 저자와 대화 후의 결과입니다.
- rust-analyzer는, IDE 같은 도구를 추상 구문 트리 기반으로 구축하다는 것을 증명했습니다.
- rslint는, rust-analyzer에 사용되어 있던 라이브러리를 사용해,  Rust에서 JavaScript 파서를 구현 가능하다는 것을 증명했습니다.
- Rome은, 저자의 허가를 받아 rslint 코드 기반을 자신들의 레포지토리에 이직했습니다.

## 추상 구문 트리 (CST)

- 기반 라이러리리는 [rowan](https://github.com/rust-analyzer/rowan)이며, 상세한 내용은 [overview of rowan](https://github.com/rust-lang/rust-analyzer/blob/master/docs/dev/syntax.md) 를 확인해주시길 바랍니다.
- Rowan (red-green trees 로 알려져있음) 은, 붉은 열매로 완성되어 [Rowan](https://en.wikipedia.org/wiki/Rowan) 이 나무 이름으로 명명되었습니다.
- red-green trees 유래는, C# 저자에 의한 [블로그](https://ericlippert.com/2012/06/08/red-green-trees/)에 설명되어 있습니다.
- Rowan은, 손실없이 소스코드 전부를 기술하는 CST를 정의, 구문 트리 부모, 자식, 형제 노드를 조사하는 일련의 API를 제공합니다.
- AST 보다도 CST를 이용하는 이점에 대해서는, [Pure AST based linting sucks](https://rdambrosio016.github.io/rust/2020/09/18/pure-ast-based-linting-sucks.html) 를 확인해주세요.
- CST는 완전히 회복 가능한 파서를 구축하는 수단을 제공합니다.

## 문법

- AST 와 동등한 문법을 정의 할 필요가 있습니다. 문법은, [xtask/codegen](https://github.com/rome/tools/tree/main/xtask/codegen) 를 사용해 자동생성됩니다.
- 문법은 [ungrammar](https://github.com/rust-analyzer/ungrammar) DSL에서 생서됩니다.
- 입력은 `ungrammar`의 소스파일, [xtask/codegen/js.ungram](https://github.com/rome/tools/blob/main/xtask/codegen/js.ungram)에 있습니다.
- 생성된 코드는,  [rome_js_syntax/src/generated](https://github.com/rome/tools/tree/main/crates/rome_js_syntax/src/generated)에 있습니다.

## 엔트리 포인트

Rome 코드 기반은 비대해져서, 파서의 엔트리 포인트를 발견하기가 조금 어려워졌습니다.

첫 경험인 분을 위해, 코드를 실해하기 위한 바이너리 엔트리 포인트 `rome_cli` 크레이트를 봅시다.

```bash
cargo run -p rome_cli

touch test.js
cargo run -p rome_cli -- check ./test.js
```

`rome_cli` 최종적으로 `rome_js_parser::parse`를 호출합니다.

```rust reference
https://github.com/rome/tools/blob/9815467c66688773bc1bb6ef9a5b2d86ca7b3682/crates/rome_js_parser/src/parse.rs#L178-L187
```

실제 파서 코드는 이렇게 시작됩니다.

```rust reference
https://github.com/rome/tools/blob/9815467c66688773bc1bb6ef9a5b2d86ca7b3682/crates/rome_js_parser/src/syntax/program.rs#L14-L17
```

## 공헌

- [CONTRIBUTING.md](https://github.com/rome/tools/blob/main/CONTRIBUTING.md)에는, 공헌 방법에 대해 설명되어 있습니다.
- 파서 테스트에 대해서는, [`cargo codegen test`](https://github.com/rome/tools/tree/main/xtask/codegen#cargo-codegen-test) 확인해주세요.
- 적합 테스트에 관해서는,  [`cargo coverage`](https://github.com/rome/tools/tree/main/xtask/coverage) 확인해주세요.
- 잘 모르는 부분이 있다면, [Discord 서버](https://discord.com/invite/rome) 에서 자유로히 질문 가능합니다.

:::info
JavaScript / TypeScript 파서는 99% 완성되어 있습니다. 공헌의 최선의 방법은, 독자 코드 기반에 Rome 테스트하거나, [Github Issue](https://github.com/rome/tools/issues)를 확인하는 것입니다.
:::
