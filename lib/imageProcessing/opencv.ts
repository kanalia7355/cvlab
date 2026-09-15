import type * as OpenCV from "@techstark/opencv-js";
export type CV = typeof OpenCV;
declare global {
  interface Window {
    cv?: CV | Promise<CV>;
  }
}
let loading: Promise<CV> | null = null;
export function loadOpenCV(): Promise<CV> {
  if (loading) return loading;
  loading = new Promise<CV>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "/vendor/opencv.js";
    script.async = true;
    let poll: ReturnType<typeof setTimeout>;
    const timer = setTimeout(
      () =>
        fail("OpenCVの読み込みが時間切れになりました。再試行してください。"),
      60000,
    );
    function fail(message: string) {
      clearTimeout(timer);
      clearTimeout(poll);
      script.remove();
      reject(new Error(message));
    }
    script.onerror = () =>
      fail(
        "OpenCVを読み込めません。配信ファイルを確認して、再試行してください。",
      );
    script.onload = () => {
      const check = async () => {
        try {
          const cv = await window.cv;
          if (cv?.Mat) {
            clearTimeout(timer);
            resolve(cv);
          } else poll = setTimeout(() => void check(), 100);
        } catch {
          fail("OpenCVを初期化できません。ページを再読み込みしてください。");
        }
      };
      void check();
    };
    document.head.appendChild(script);
  }).catch((error) => {
    loading = null;
    throw error;
  });
  return loading;
}
export const filters = [
  "Original",
  "Grayscale",
  "Binary",
  "Edge",
  "Blur",
  "Mosaic",
  "Invert",
  "Contour",
] as const;
export type Filter = (typeof filters)[number];
export type Settings = {
  binary: number;
  low: number;
  high: number;
  blur: number;
  mosaic: number;
};
export const descriptions: Record<Filter, string> = {
  Original:
    "カメラから受け取った、そのままの画像です。ほかの処理結果と見比べてください。",
  Grayscale:
    "赤・緑・青の成分を明るさに変換します。色を取り除くと、形や陰影が見えてきます。",
  Binary:
    "しきい値より明るい画素を白、それ以外を黒にします。文字の読み取りなどで使われる処理です。",
  Edge: "明るさが急に変わる場所をCanny法で検出します。2つのしきい値で、輪郭の拾い方が変わります。",
  Blur: "周囲の画素をガウス分布の重みで混ぜ、画像をぼかします。細かなノイズを減らせます。",
  Mosaic:
    "画像を小さくしてから、画素をそのまま引き伸ばします。画素の大きさを実感できます。",
  Invert:
    "各色の値を255から引きます。明暗も色も反対になり、写真のネガのように見えます。",
  Contour:
    "二値画像の境界をつないで輪郭を取り出します。物体の形や面積を調べる入口になります。",
};
export function processImage(
  cv: CV,
  source: HTMLCanvasElement,
  target: HTMLCanvasElement,
  filter: Filter,
  s: Settings,
) {
  const src = cv.imread(source),
    dst = new cv.Mat(),
    gray = new cv.Mat();
  try {
    if (filter === "Original") src.copyTo(dst);
    else if (filter === "Invert") cv.bitwise_not(src, dst);
    else if (filter === "Blur")
      cv.GaussianBlur(
        src,
        dst,
        new cv.Size(s.blur * 2 + 1, s.blur * 2 + 1),
        0,
        0,
        cv.BORDER_DEFAULT,
      );
    else if (filter === "Mosaic") {
      cv.resize(
        src,
        dst,
        new cv.Size(
          Math.max(1, Math.floor(src.cols / s.mosaic)),
          Math.max(1, Math.floor(src.rows / s.mosaic)),
        ),
        0,
        0,
        cv.INTER_AREA,
      );
      cv.resize(
        dst,
        dst,
        new cv.Size(src.cols, src.rows),
        0,
        0,
        cv.INTER_NEAREST,
      );
    } else {
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
      if (filter === "Grayscale") gray.copyTo(dst);
      else if (filter === "Binary")
        cv.threshold(gray, dst, s.binary, 255, cv.THRESH_BINARY);
      else if (filter === "Edge") {
        cv.GaussianBlur(gray, gray, new cv.Size(3, 3), 0);
        cv.Canny(
          gray,
          dst,
          Math.min(s.low, s.high),
          Math.max(s.low, s.high),
          3,
          true,
        );
      } else {
        cv.threshold(gray, gray, s.binary, 255, cv.THRESH_BINARY);
        const contours = new cv.MatVector(),
          hierarchy = new cv.Mat();
        try {
          cv.findContours(
            gray,
            contours,
            hierarchy,
            cv.RETR_EXTERNAL,
            cv.CHAIN_APPROX_SIMPLE,
          );
          cv.cvtColor(gray, dst, cv.COLOR_GRAY2RGBA);
          dst.setTo(new cv.Scalar(20, 29, 27, 255));
          cv.drawContours(
            dst,
            contours,
            -1,
            new cv.Scalar(224, 240, 227, 255),
            1,
          );
        } finally {
          contours.delete();
          hierarchy.delete();
        }
      }
    }
    cv.imshow(target, dst);
  } finally {
    src.delete();
    dst.delete();
    gray.delete();
  }
}
