import Link from "next/link";
import { IntroArt } from "./IntroArt";
export function StartScreen() {
  return (
    <>
      <section className="hero">
        <div className="intro">
          <h1>見える世界を、分解する。</h1>
          <p>
            色をなくす。明暗を分ける。輪郭を取り出す。
            <br />
            ひとつの映像から、8通りの見え方を探そう。
          </p>
        </div>
        <div className="workspace">
          <figure className="hero-visual">
            <IntroArt kind="cv-lab" />
            <figcaption className="figure-caption">
              <span>テスト図形による処理例</span>
              <span>Original / Gray / Binary / Invert</span>
            </figcaption>
          </figure>
          <aside>
            <h2>
              動かして、
              <br />
              見比べる。
            </h2>
            <p>
              まずは4画面で比較。気になるフィルターを選んで、しきい値やぼかしを調整できます。
            </p>
            <Link className="button primary mt-6" href="/experience">
              実験台を開く
            </Link>
            <p className="privacy">カメラなしでも、テスト図形で試せます。</p>
          </aside>
        </div>
      </section>
    </>
  );
}
