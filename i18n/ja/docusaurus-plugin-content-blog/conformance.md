---
title: パーサーの適合試験
---

この記事では、JavaScript および TypeScript の文法に対するパーサーのテストを行うための 3 つの GitHub リポジトリについて詳しく説明します。

<!--truncate-->

## Test262

JavaScript には、Test262 と呼ばれる [ECMAScript のテストスイート](https://github.com/tc39/test262)があります。
Test262 の目標は、仕様で指定されたすべての観測可能な動作をカバーするテストスイートを提供することです。

実際に適合性のテストを実施するにあたっては、こちらの[パースフェーズのテスト](https://github.com/tc39/test262/blob/main/INTERPRETING.md#negative)を確認するのが良いでしょう。

## Babel

JavaScript に新しい言語機能が追加されると、Babel でもそれらを解析する必要があります。
したがって、Babel には独自の[パーサーテスト](https://github.com/babel/babel/tree/main/packages/babel-parser/test)があります。

## TypeScript

TypeScript における適合性テストは[こちら](https://github.com/microsoft/TypeScript/tree/main/tests/cases/conformance)で見つけることができます。

## Test Runner

Rome は上記のテストスイート用にテストランナーを実装しており、[こちら](https://github.com/rome/tools/tree/main/xtask/coverage)から確認することができます。
