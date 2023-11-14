---
title: 파서 적합 시험
---

이 글에서는 JavaScript 혹은 TypeScript 문법에 파서 테스트를 하기 위한 3개의 GitHub 레포지토리에 대해 상세히 설명합니다.

<!--truncate-->

## Test262

JavaScript에는, Test262라 하는 [ECMAScript 테스트 스위트](https://github.com/tc39/test262)가 있습니다.
Test262 목표는, 사양 지정된 모든 측정 가능한 동작을 커버하는 테스트 스위트를 제공하는 것입니다.

실제 적합성 테스트를 실시함에 따라, 여기에 있는 [parse 단계에서 테스트](https://github.com/tc39/test262/blob/main/INTERPRETING.md#negative)를 확인하는 것이 좋습니다.

## Babel

JavaScript에 새로운 언어 기능이 추가되면, Babel 에서도 이를 해석할 필요가 있습니다.
이에, Babel에는 독자적 [파서 테스트](https://github.com/babel/babel/tree/main/packages/babel-parser/test)가 있습니다.

## TypeScript

TypeScript 적합성 테스트는 [이곳](https://github.com/microsoft/TypeScript/tree/main/tests/cases/conformance)에서 확인할 수 있습니다.

## Test Runner

Rome는 상기한 테스트 스위트 용으로 테스트 러너를 구현해두었으며, [여기서](https://github.com/rome/tools/tree/main/xtask/coverage) 확인 가능합니다.
