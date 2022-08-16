---
title: Conformance Tests
---

This article details three github repositories for testing our parser against JavaScript and TypeScript grammar.

<!--truncate-->

## Test262

JavaScript has the [ECMAScript Test Suite](https://github.com/tc39/test262) called Test262.
The goal of Test262 is to provide test material that covers every observable behavior specified in the specification.

For testing conformance, please checkout its [parse phase tests](https://github.com/tc39/test262/blob/main/INTERPRETING.md#negative).

## Babel

When new language features are added to JavaScript, it is required to have them get parsed by Babel.
So Babel has another set of [parser tests](https://github.com/babel/babel/tree/main/packages/babel-parser/test).

## TypeScript

The TypeScript conformance tests can be found [here](https://github.com/microsoft/TypeScript/tree/main/tests/cases/conformance).

## Test Runner

Rome has implemented a test runner for the above test suites, they can be found [here](https://github.com/rome/tools/tree/main/xtask/coverage).
