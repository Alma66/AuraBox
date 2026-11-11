const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'assets');
const mark = fs.readFileSync(path.join(root, 'public', 'aurabox-mark.svg'));

const NAVY = '#1F3350';
const CREAM = '#FBF4E9';
const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 };

const renderMark = (size) =>
  sharp(mark, { density: 800 }).resize(size, size, { fit: 'contain', background: CLEAR }).png().toBuffer();

const canvas = (size, background) => sharp({ create: { width: size, height: size, channels: 4, background } });

const offset = (size, inner) => Math.round((size - inner) / 2);

const roundedTile = (size, radius, color) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="${color}"/></svg>`);

const iconOnly = async () => {
  const size = 1024;
  const inner = 760;
  return canvas(size, CREAM)
    .composite([{ input: await renderMark(inner), left: offset(size, inner), top: offset(size, inner) }])
    .png()
    .toFile(path.join(outDir, 'icon-only.png'));
};

const iconForeground = async () => {
  const size = 1024;
  const inner = 640;
  return canvas(size, CLEAR)
    .composite([{ input: await renderMark(inner), left: offset(size, inner), top: offset(size, inner) }])
    .png()
    .toFile(path.join(outDir, 'icon-foreground.png'));
};

const iconBackground = () => canvas(1024, CREAM).png().toFile(path.join(outDir, 'icon-background.png'));

const splash = async (fileName) => {
  const size = 2732;
  const tile = 960;
  const inner = 720;
  return canvas(size, NAVY)
    .composite([
      { input: roundedTile(tile, 220, CREAM), left: offset(size, tile), top: offset(size, tile) },
      { input: await renderMark(inner), left: offset(size, inner), top: offset(size, inner) },
    ])
    .png()
    .toFile(path.join(outDir, fileName));
};

const run = async () => {
  fs.mkdirSync(outDir, { recursive: true });
  await Promise.all([iconOnly(), iconForeground(), iconBackground(), splash('splash.png'), splash('splash-dark.png')]);
  console.log('Assets listos en la carpeta assets');
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});