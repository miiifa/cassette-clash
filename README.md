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

## Androidアプリとして入れる

スマホのホーム画面から普通のアプリみたいに開きたい場合は、APKを作って入れます。

このリポジトリには Android WebView アプリと、APKを作る GitHub Actions workflow を追加済みです。

APKの作り方:

1. GitHub のリポジトリで `Actions` を開く
2. `Build Android APK` を開く
3. `Run workflow` を押す
4. ビルドが終わったら、実行結果の `Artifacts` から `pokemon-duel-offline-debug-apk` をダウンロードする
5. ZIPを展開して `app-debug.apk` をタップする
6. Android の警告が出たら、このインストール元を許可して入れる
7. ホーム画面に `コマスター` というアプリが出る

## 2回目以降の更新

アプリ本体を毎回入れ直さなくて済むように、アプリ内に `HTML更新` ボタンを追加しています。

`play.html` だけを変更した場合は、APKを作り直さなくても更新できます。

1. GitHubで新しい `play.html` を開く
2. `Raw` またはメニューから `play.html` をダウンロードする
3. スマホの `コマスター` アプリを開く
4. 上部の `HTML更新` を押す
5. ダウンロードした `play.html` を選ぶ
6. 画面が更新される

`内蔵版に戻す` を押すと、APKに最初から入っている `play.html` に戻せます。

アプリアイコンやネイティブ側のボタンなど、Androidアプリ本体を変更した場合だけ、新しいAPKのインストールが必要です。

## スマホでHTMLとして遊ぶ

APK化せずに private リポジトリのまま個人で遊ぶなら、`play.html` を使います。

`play.html` は CSS と JavaScript を全部まとめた1ファイル版なので、スマホにダウンロードしてブラウザで開けます。外部ファイルを読み込まないため、`index.html` よりスマホ向きです。

Android での目安:

1. GitHub アプリまたはブラウザで `play.html` を開く
2. `Raw` またはメニューからダウンロードする
3. ダウンロードした `play.html` を Chrome で開く
4. ベンチの駒をタップ → 光ったSPをタップして出撃
5. 盤面の自分の駒をタップ → 青いマスへ移動、赤いマスで攻撃

GitHub の画面上でHTMLソースが表示されるだけの場合は、表示ではなく「ダウンロード」してから開いてください。

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

GitHub Pages 用の workflow はありますが、private リポジトリのまま個人利用するなら無理に使わなくてよいです。

public 化すると権利面のリスクが上がるため、現時点では private のまま `play.html` またはAPKを使う方針がおすすめです。

## ローカル起動

PCで触る場合は、ブラウザのES Modulesを使うため、ローカルサーバー経由で開くのがおすすめです。

```bash
python3 -m http.server 8000
```

そのあと以下を開きます。

```txt
http://localhost:8000
```

スマホではAPKか `play.html` を使う方が簡単です。

## ファイル構成

```txt
.
├── .github/
│   └── workflows/
│       ├── build-android-apk.yml
│       └── deploy-pages.yml
├── .nojekyll
├── app/
│   ├── build.gradle
│   └── src/main/
│       ├── AndroidManifest.xml
│       ├── java/com/miiifa/pokemondueloffline/MainActivity.java
│       └── res/values/styles.xml
├── build.gradle
├── settings.gradle
├── index.html
├── play.html
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

1. APKのビルド結果を確認する
2. play.html のスマホ操作性を改善する
3. Serebii / Archive / 参考リポジトリからフィギュアデータを増やす
4. 攻撃ホイールのサイズを実データに寄せる
5. プレートを追加する
6. 特性と状態異常を追加する
7. セーブ/ロードを localStorage に入れる

## 注意

個人利用前提のプロトタイプです。公開・配布する場合は、名称・画像・技名などの権利面に注意してください。
