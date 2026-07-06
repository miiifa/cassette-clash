# Pokemon Duel Offline MVP

個人用のオフライン版「ポケモンコマスター / Pokémon Duel」風プロトタイプです。

## 目的

まずはオンライン対戦なしで、1台のブラウザ上で2人分の操作を交互に行える最小構成を作ります。

## できること

- 盤面表示
- ベンチからスポーンに出撃
- MPに応じた移動
- 隣接フィギュアへのバトル
- 攻撃ホイールのランダムスピン
- 色ごとの簡易勝敗判定
- 負けたフィギュアをPCへ送る
- PCが2体を超えたら古いフィギュアをベンチへ戻す
- 相手ゴール到達で勝利

## まだ入れていないもの

- プレート
- 特性
- 状態異常
- 進化
- 包囲KOの完全再現
- AI
- オンライン対戦
- 公式画像/アセット

## デプロイ

GitHub Pages 用の workflow を追加済みです。

`main` ブランチに push されると、`.github/workflows/deploy-pages.yml` が実行され、リポジトリ直下の静的ファイルを GitHub Pages にデプロイします。

初回だけ GitHub 側で Pages の設定が必要な場合があります。

1. Repository の `Settings` を開く
2. `Pages` を開く
3. `Build and deployment` の Source を `GitHub Actions` にする
4. `Actions` タブで `Deploy static site to GitHub Pages` を実行、または `main` に push する

公開URLは通常この形式です。

```txt
https://miiifa.github.io/pokemon-duel-offline/
```

## ローカル起動

ブラウザのES Modulesを使うため、ローカルサーバー経由で開くのがおすすめです。

```bash
python3 -m http.server 8000
```

そのあと以下を開きます。

```txt
http://localhost:8000
```

VS Code を使う場合は、Live Server 拡張などで開くと開発しやすいです。

## ファイル構成

```txt
.
├── .github/
│   └── workflows/
│       └── deploy-pages.yml
├── .nojekyll
├── index.html
├── styles.css
├── data/
│   └── figures.js
└── src/
    ├── board.js
    ├── battle.js
    ├── game.js
    └── app.js
```

## 次にやるとよさそうなこと

1. Serebii / Archive / 参考リポジトリからフィギュアデータを増やす
2. 攻撃ホイールのサイズを実データに寄せる
3. プレートを `data/plates.js` に追加する
4. 特性を `effects` として関数化する
5. セーブ/ロードを localStorage に入れる

## 注意

個人利用前提のプロトタイプです。公開・配布する場合は、名称・画像・技名などの権利面に注意してください。
