# Computer Vision Lab

カメラ映像にフィルターをかけて、画像処理の違いを見比べる展示です。グレースケール、二値化、Canny、ぼかし、モザイク、色反転、輪郭抽出を試せます。

最初は4画面で比較し、気になった処理を1画面で調整します。カメラがなくてもテスト図形で動きます。処理にはOpenCV.jsを使っています。

![画面](docs/screenshot.png)

## 手元で動かす

Node.js 22を使います。

```sh
npm ci
npm run dev
```

http://localhost:3003 を開いてください。モデルや画像はリポジトリに含めています。再取得するときだけ `npm run assets` を実行します。

カメラ映像は端末内で処理します。HTTPSまたはlocalhostから開き、ブラウザーのカメラ使用を許可してください。

## Vercelに置く

Vercelの **Add New → Project** から [`kanalia7355/cvlab`](https://github.com/kanalia7355/cvlab) を選びます。Root Directoryはリポジトリ直下。Next.js、Node.js 22、インストール・ビルドコマンドは設定ファイルに指定済みです。環境変数や外部DBの設定はありません。

推論はブラウザーで動き、モデルとWASMはアプリと同じ配信元から読み込みます。初回表示にはモデルのダウンロード時間がかかります。

```sh
npm run lint
npm run typecheck
npm run build
```

動作確認の範囲は [VALIDATION.md](VALIDATION.md)、ライブラリと素材の出典は [THIRD_PARTY.md](THIRD_PARTY.md) にまとめています。
