import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');
const iconsDir = path.join(publicDir, 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Read the main SVG
const iconSvg = fs.readFileSync(path.join(publicDir, 'icons', 'icon.svg'));
const faviconSvg = fs.readFileSync(path.join(publicDir, 'favicon.svg'));
const appleSvg = fs.readFileSync(path.join(publicDir, 'apple-touch-icon.svg'));
const ogSvg = fs.readFileSync(path.join(publicDir, 'og-image.svg'));

async function generateIcons() {
  console.log('🎨 Generating favicon set...\n');

  // Standard favicons
  const sizes = [16, 32, 48, 64, 96, 128, 192, 256, 384, 512];
  
  for (const size of sizes) {
    const outputPath = path.join(iconsDir, `icon-${size}.png`);
    await sharp(iconSvg)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`  ✓ icon-${size}.png`);
  }

  // Favicon PNGs
  await sharp(faviconSvg).resize(16, 16).png().toFile(path.join(iconsDir, 'favicon-16x16.png'));
  await sharp(faviconSvg).resize(32, 32).png().toFile(path.join(iconsDir, 'favicon-32x32.png'));
  console.log('  ✓ favicon-16x16.png');
  console.log('  ✓ favicon-32x32.png');

  // Apple Touch Icons
  const appleSizes = [57, 60, 72, 76, 114, 120, 144, 152, 167, 180];
  for (const size of appleSizes) {
    await sharp(appleSvg)
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, `apple-touch-icon-${size}x${size}.png`));
    console.log(`  ✓ apple-touch-icon-${size}x${size}.png`);
  }

  // Main apple touch icon
  await sharp(appleSvg).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('  ✓ apple-touch-icon.png (180x180)');

  // Microsoft Tiles
  const msTiles = [
    { size: 70, name: 'mstile-70x70.png' },
    { size: 150, name: 'mstile-150x150.png' },
    { size: 310, name: 'mstile-310x310.png' },
  ];
  
  for (const tile of msTiles) {
    await sharp(iconSvg)
      .resize(tile.size, tile.size)
      .png()
      .toFile(path.join(iconsDir, tile.name));
    console.log(`  ✓ ${tile.name}`);
  }

  // Wide MS tile (310x150)
  await sharp(iconSvg)
    .resize(150, 150)
    .extend({
      top: 0,
      bottom: 0,
      left: 80,
      right: 80,
      background: { r: 10, g: 10, b: 10, alpha: 1 }
    })
    .png()
    .toFile(path.join(iconsDir, 'mstile-310x150.png'));
  console.log('  ✓ mstile-310x150.png');

  // OG Image (1200x630)
  await sharp(ogSvg)
    .resize(1200, 630)
    .png()
    .toFile(path.join(publicDir, 'og-image.png'));
  console.log('  ✓ og-image.png (1200x630)');

  // ICO file (multi-resolution)
  // Note: sharp doesn't support ICO directly, but we can create a 32x32 PNG as fallback
  await sharp(faviconSvg)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('  ✓ favicon.ico (32x32 PNG fallback)');

  console.log('\n✅ All favicons generated successfully!');
  console.log(`\n📁 Output directory: ${iconsDir}`);
}

generateIcons().catch(console.error);



