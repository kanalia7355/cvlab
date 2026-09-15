"use client";
import { useRef, useState } from "react";
import { useCamera } from "@/hooks/useCamera";
import { useAnimationFrame } from "@/hooks/useAnimationFrame";
import { Camera } from "./Camera";
import { PermissionDialog } from "./PermissionDialog";
import { Status } from "./Status";
import { drawSample } from "@/lib/drawing";
import {
  descriptions,
  filters,
  loadOpenCV,
  processImage,
  type CV,
  type Filter,
  type Settings,
} from "@/lib/imageProcessing/opencv";
export default function Experience() {
  const camera = useCamera(),
    source = useRef<HTMLCanvasElement>(null),
    outputs = useRef<(HTMLCanvasElement | null)[]>([]),
    engine = useRef<CV | null>(null);
  const [ready, setReady] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [selected, setSelected] = useState<Filter>("Edge"),
    [compare, setCompare] = useState(true),
    [paused, setPaused] = useState(false),
    [sample, setSample] = useState(true),
    [fps, setFps] = useState(0);
  const counter = useRef({ time: 0, frames: 0 });
  const [settings, setSettings] = useState<Settings>({
    binary: 128,
    low: 70,
    high: 160,
    blur: 4,
    mosaic: 12,
  });
  const initialize = async () => {
    setBusy(true);
    setError("");
    try {
      engine.current = await loadOpenCV();
      setReady(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "OpenCVを開始できません。");
    } finally {
      setBusy(false);
    }
  };
  const shown: Filter[] = compare
    ? [
        "Original",
        "Grayscale",
        "Binary",
        selected === "Original" ||
        selected === "Grayscale" ||
        selected === "Binary"
          ? "Edge"
          : selected,
      ]
    : [selected];
  useAnimationFrame(
    (time) => {
      const input = source.current,
        cv = engine.current;
      if (!input || !cv) return;
      const ctx = input.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      if (
        camera.status === "ready" &&
        camera.videoRef.current?.readyState === 4
      ) {
        ctx.save();
        ctx.translate(320, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(camera.videoRef.current, 0, 0, 320, 180);
        ctx.restore();
      } else if (sample) drawSample(ctx, time, 320, 180);
      else return;
      try {
        shown.forEach((filter, i) => {
          const out = outputs.current[i];
          if (out) processImage(cv, input, out, filter, settings);
        });
      } catch {
        setError("画像処理を続けられません。読み込みを再試行してください。");
        setReady(false);
      }
      const c = counter.current;
      c.frames++;
      if (time - c.time >= 1000) {
        setFps(Math.round((c.frames * 1000) / (time - c.time)));
        c.frames = 0;
        c.time = time;
      }
    },
    ready && !paused,
    30,
  );
  const slider = (
    key: keyof Settings,
    label: string,
    min: number,
    max: number,
  ) => (
    <label key={key}>
      {label}
      <output className="readout">{settings[key]}</output>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        value={settings[key]}
        onChange={(e) => setSettings({ ...settings, [key]: +e.target.value })}
      />
    </label>
  );
  return (
    <>
      <div className="intro">
        <h1>画像を、ひとつずつ分解。</h1>
        <p>同じ映像を見比べながら、画素の変化を観察してください。</p>
      </div>
      <div className="workspace">
        <section>
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              className="button"
              aria-pressed={compare}
              onClick={() => setCompare(!compare)}
            >
              {compare ? "1画面で詳しく" : "4画面で比較"}
            </button>
            <button
              className="button"
              disabled={!ready}
              aria-pressed={paused}
              onClick={() => setPaused(!paused)}
            >
              {paused ? "映像を再開" : "映像を一時停止"}
            </button>
            <span className="self-center">
              {paused ? "一時停止" : `${fps} FPS`}
            </span>
          </div>
          <div className={compare ? "comparison" : "stage"}>
            {shown.map((filter, i) => (
              <figure key={filter}>
                <canvas
                  ref={(el) => {
                    outputs.current[i] = el;
                  }}
                  width={320}
                  height={180}
                  role="img"
                  aria-label={`${filter} の処理結果`}
                />
                <figcaption>{filter}</figcaption>
              </figure>
            ))}
          </div>
          <canvas
            className="capture-video"
            ref={source}
            width={320}
            height={180}
          />
          <Camera videoRef={camera.videoRef} />
          <PermissionDialog camera={camera} />
        </section>
        <aside className="panel">
          <h2>フィルター</h2>
          <div className="filter-list">
            {filters.map((f) => (
              <button
                className="button"
                key={f}
                aria-pressed={f === selected}
                onClick={() => {
                  setSelected(f);
                  if (["Original", "Grayscale", "Binary"].includes(f))
                    setCompare(false);
                }}
              >
                {f}
              </button>
            ))}
          </div>
          <p>{descriptions[selected]}</p>
          {(["Binary", "Contour"].includes(selected) || compare) &&
            slider("binary", "二値化のしきい値", 0, 255)}
          {(selected === "Edge" || compare) && (
            <>
              {slider("low", "輪郭：弱い境界", 0, 255)}
              {slider("high", "輪郭：強い境界", 0, 255)}
            </>
          )}
          {selected === "Blur" && slider("blur", "ぼかしの半径", 1, 15)}
          {selected === "Mosaic" &&
            slider("mosaic", "画素ブロックの大きさ", 2, 40)}
          <label className="flex gap-3 items-center">
            <input
              type="checkbox"
              checked={sample}
              onChange={(e) => setSample(e.target.checked)}
            />
            カメラ停止中はテスト図形を使う
          </label>
          {!ready && !busy && (
            <button
              className="button primary mt-4"
              onClick={() => void initialize()}
            >
              画像処理を開始
            </button>
          )}
          <Status
            busy={busy}
            error={error}
            message={
              ready
                ? "OpenCV 準備完了"
                : "まず画像処理を開始してください。カメラなしでも試せます。"
            }
            retry={() => void initialize()}
          />
          <button
            className="text-link"
            onClick={() =>
              setSettings({
                binary: 128,
                low: 70,
                high: 160,
                blur: 4,
                mosaic: 12,
              })
            }
          >
            調整値をリセット
          </button>
        </aside>
      </div>
    </>
  );
}
