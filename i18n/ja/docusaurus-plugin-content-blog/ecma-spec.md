---
title: ECMAScript の仕様
---

[ECMAScript® 2023言語仕様書](https://tc39.es/ecma262/) は、JavaScript についてのすべての詳細を記載しており、誰でも独自の JavaScript エンジンを実装することができます。

以下の章を私たちのパーサーのために学習する必要があります：

- 第5章：表記規則
- 第11章：ECMAScript 言語：ソーステキスト
- 第12章：ECMAScript 言語：字句文法
- 第13章〜第16章：式、文、関数、クラス、スクリプト、モジュール
- 付録B：Web ブラウザ向けの追加 ECMAScript 機能
- 付録C：ECMAScript の厳密モード

仕様書内のナビゲーションのために：

- クリック可能なものには永続的なリンクがあり、URL にアンカーとして表示されます。例：`#sec-identifiers`
- ホバーするとツールチップが表示され、`References` をクリックするとその参照が表示されます

## 表記規則

[第5.1.5節 文法表記](https://tc39.es/ecma262/#sec-grammar-notation) を読む必要があります。

ここで注意するべき点は次のとおりです：

### 再帰

これは文法でリストが表示される方法です。

```markup
ArgumentList :
  AssignmentExpression
  ArgumentList , AssignmentExpression
```

という意味です

```javascript
a, b = 1, c = 2
^_____________^ ArgumentList
   ^__________^ ArgumentList, AssignmentExpression,
          ^___^ AssignmentExpression
```

### オプション

オプションの構文には `_opt_` 接尾辞が付きます。例えば、

```markup
VariableDeclaration :
  BindingIdentifier Initializer_opt
```

という意味です

```javascript
var binding_identifier;
var binding_identifier = Initializer;
                       ______________ Initializer_opt
```

### パラメータ

`[Return]` と `[In]` は文法のパラメータです。

例えば

```markdup
ScriptBody :
    StatementList[~Yield, ~Await, ~Return]
```

という意味です。トップレベルの yield、await、return はスクリプトでは許可されていませんが、

```markdup
ModuleItem :
  ImportDeclaration
  ExportDeclaration
  StatementListItem[~Yield, +Await, ~Return]
```

ではトップレベルの await が許可されています。

## ソーステキスト

[第11.2節 ソースコードの種類](https://tc39.es/ecma262/#sec-types-of-source-code) では、スクリプトコードとモジュールコードの間には大きな違いがあることが述べられています。
また、古い JavaScript の振る舞いを禁止するための `use strict` モードがあります。

**スクリプトコード** は厳密ではありません。スクリプトコードを厳密にするためには、ファイルの先頭に `use strict` を挿入する必要があります。
HTMLでは `<script src="javascript.js"></script>` と書きます。

**モジュールコード** は自動的に厳密です。
HTMLでは `<script type="module" src="main.mjs"></script>` と書きます。

## ECMAScript言語：字句文法

より詳細な説明については、V8 ブログの [ECMAScript仕様の理解](https://v8.dev/blog/understanding-ecmascript-part-3) を読んでください。

### [自動セミコロン挿入](https://tc39.es/ecma262/#sec-automatic-semicolon-insertion)

このセクションでは、JavaScript を書く際にセミコロンを省略できるルールについて説明しています。
すべての説明は次のように要約されます

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

`asi` 関数は適用可能な場所で手動で呼び出す必要があります。例えば、文の最後で呼び出されます。

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

この asi のセクションはパーサーを想定して書かれており、ソーステキストは左から右に解析されることが明示的に述べられています。これにより、他の方法でパーサーを書くことはほとんど不可能になります。jsparagus の作者は [ここ](https://github.com/mozilla-spidermonkey/jsparagus/blob/master/js-quirks.md#automatic-semicolon-insertion-) でこれについての愚痴を述べています。

> この機能の仕様は非常に高レベルであり、奇妙な手続き的なものです（「ソーステキストが左から右に解析されるときに、トークンが遭遇されると...」というように、仕様がブラウザについてのストーリーを語っているかのようです。私の知る限り、これは解析の内部実装の詳細について何かが前提されたり暗示されたりする仕様の唯一の場所です。）しかし、asi を他の方法で指定するのは難しいでしょう。

:::

## 式、文、関数、クラス、スクリプト、モジュール

構文的な文法を理解し、それをパーサーの作成に適用するには時間がかかります。
より詳細な内容は、[文法チュートリアル](./grammar.md) で見つけることができます。

## 付録B
