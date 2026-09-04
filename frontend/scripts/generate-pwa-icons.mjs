import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");
const sourceSvg = path.join(publicDir, "icon.svg");

async function generateIcons() {
  console.log("Generating PWA icons from:", sourceSvg);

  if (!fs.existsSync(sourceSvg)) {
    console.error("Source SVG not found at", sourceSvg);
    process.exit(1);
  }

  const svgBuffer = fs.readFileSync(sourceSvg);

  // 1. Standard 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png({ quality: 95 })
    .toFile(path.join(publicDir, "icon-192.png"));
  console.log("✓ Generated icon-192.png (192x192)");

  // 2. Standard 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png({ quality: 95 })
    .toFile(path.join(publicDir, "icon-512.png"));
  console.log("✓ Generated icon-512.png (512x512)");

  // 3. Apple Touch Icon 180x180 (opaque background)
  await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: { r: 9, g: 9, b: 11, alpha: 1 }, // #09090b
    },
  })
    .composite([
      {
        input: await sharp(svgBuffer).resize(150, 150).toBuffer(),
        top: 15,
        left: 15,
      },
    ])
    .png({ quality: 95 })
    .toFile(path.join(publicDir, "apple-touch-icon.png"));
  console.log("✓ Generated apple-touch-icon.png (180x180)");

  // 4. Maskable 192x192 (safe zone padding: ~80% of canvas)
  await sharp({
    create: {
      width: 192,
      height: 192,
      channels: 4,
      background: { r: 9, g: 9, b: 11, alpha: 1 }, // #09090b
    },
  })
    .composite([
      {
        input: await sharp(svgBuffer).resize(154, 154).toBuffer(),
        top: 19,
        left: 19,
      },
    ])
    .png({ quality: 95 })
    .toFile(path.join(publicDir, "icon-maskable-192.png"));
  console.log("✓ Generated icon-maskable-192.png (192x192 maskable)");

  // 5. Maskable 512x512 (safe zone padding: ~80% of canvas)
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 9, g: 9, b: 11, alpha: 1 }, // #09090b
    },
  })
    .composite([
      {
        input: await sharp(svgBuffer).resize(410, 410).toBuffer(),
        top: 51,
        left: 51,
      },
    ])
    .png({ quality: 95 })
    .toFile(path.join(publicDir, "icon-maskable-512.png"));
  console.log("✓ Generated icon-maskable-512.png (512x512 maskable)");

  console.log("All PWA icons generated successfully!");
}

generateIcons().catch((err) => {
  console.error("Icon generation failed:", err);
  process.exit(1);
});
