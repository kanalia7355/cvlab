import Link from "next/link";
export default function About() {
  return (
    <main id="main" className="about">
      <h1>Computer Vision Lab の仕組み</h1>
      <section>
        <h2>何をしている？</h2>
        <p>
          OpenCV.jsで、320 ×
          180に縮小した映像を処理します。Grayscale、Binary、Canny Edge、Gaussian
          Blur、Mosaic、Invert、Contourと入力画像を比較します。
        </p>
        <p>
          二値化は0〜255のしきい値で明暗を分けます。Cannyは弱い境界と強い境界の2つのしきい値を使います。輪郭抽出は二値化した領域の外側をつなぎます。
        </p>
      </section>
      <section>
        <h2>体験の準備</h2>
        <p>
          カメラを許可するか、テスト図形を使って開始してください。4画面比較と1画面表示を切り替えられます。一時停止すると、現在の結果をじっくり観察できます。
        </p>
        <p>
          Chrome・EdgeのPC／タブレットで、HTTPSまたはlocalhostから開いてください。端末の性能や照明で処理速度・認識結果は変わります。
        </p>
      </section>
      <section>
        <h2>映像と記録の扱い</h2>
        <p>
          カメラ映像は画像処理のみに利用し、サーバーへの送信・保存は行いません。カメラ停止、別タブへの移動、ページ離脱時に撮影を停止します。
        </p>
        <p>
          処理モデル・ライブラリ・フォントはアプリと同じ配信元から読み込みます。初回のアプリ表示には配信元への接続が必要です。
        </p>
      </section>
      <Link href="/experience" className="button primary">
        体験を始める
      </Link>
    </main>
  );
}
