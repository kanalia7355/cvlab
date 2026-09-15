import { mkdir, copyFile, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
await mkdir("public/vendor", { recursive: true });
await copyFile(
  "node_modules/@techstark/opencv-js/dist/opencv.js",
  "public/vendor/opencv.js",
);
await copyFile(
  "node_modules/@techstark/opencv-js/LICENSE",
  "public/vendor/OpenCV-LICENSE.txt",
);
const data = await readFile("public/vendor/opencv.js");
await writeFile(
  "public/assets-manifest.json",
  JSON.stringify(
    [
      {
        path: "public/vendor/opencv.js",
        package: "@techstark/opencv-js@4.11.0-release.1",
        sha256: createHash("sha256").update(data).digest("hex"),
      },
    ],
    null,
    2,
  ),
);
