---
id: overview
title: Overview
---

이 가이드에서는 표준 컴파일러 프론트엔드 단계를 적용합니다:

```markup
Source Text --> Lexer --> Token --> Parser --> AST
```

자바스크립트 파서를 작성하는 것은 어렵지 않습니다.
아키텍처에 대한 의사결정이 10%, 세부적인 디테일에 대한 노력이 90%를 차지하죠.

아키텍처상의 의사결정은 크게 두 가지 범주에 영향을 미칩니다.

- 파서의 성능
- AST를 다루는 것이 얼마나 멋진가?

Rust에서 파서를 만들기 전에 모든 옵션과 트레이드오프에 대해 알아두면, 우리의 여정이 더 편안해질 것입니다.

## Performance

고성능 Rust 프로그램의 핵심은 **메모리 할당량을 줄이는 것**과 **CPU 사이클을 줄이는 것**에 있습니다.

`Vec`, `Box`, `String`과 같은 힙에 할당된 객체를 찾는 것만으로도 메모리 할당이 거의 투명하게 이루어집니다.
사용량을 추정하면 프로그램이 얼마나 빠른지 알 수 있습니다. 할당량이 늘어날수록 프로그램은 느려집니다.

Rust의 제로 코스트 추상화 덕분에 추상화로 인한 성능 저하를 크게 걱정할 필요가 없습니다.
알고리즘의 복잡성만 주의하면 문제가 없죠.

:::info
[The Rust Performance Book](https://nnethercote.github.io/perf-book/introduction.html)를 읽어보시면 좋을 듯 합니다.
:::

## Rust Source Code

함수 호출의 성능을 짐작할 수 없을 때마다 Rust의 문서에서 "소스" 버튼을 겁내지 말고 클릭하여 소스 코드를 읽어보면 대부분 쉽게 이해할 수 있을 것입니다.

:::info
Rust의 소스코드를 읽을 때, `fn function_name`, `struct struct_name`, `enum enum_name`과 같은 정의된 부분을 찾으면 됩니다.
이는 일관된 문법을 가진 Rust(JavaScript와 비교했을 때 😉)의 장점 중 하나입니다.
:::
