import Link from "next/link";
export function Header() {
  return (
    <header className="header mast">
      <Link href="/" className="brand">
        Computer Vision Lab
      </Link>
      <nav aria-label="メインナビゲーション">
        <Link href="/experience">体験する</Link>
        <Link href="/about">仕組みを知る</Link>
      </nav>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="footer colophon">
      <span>Computer Vision Lab</span>
      <span>画像処理の体験展示 · 映像は端末内で処理</span>
      <Link href="/about">この展示について</Link>
    </footer>
  );
}
