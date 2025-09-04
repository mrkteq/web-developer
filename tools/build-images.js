const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const INPUT_DIR = path.resolve(__dirname, '..', 'img');
const OUTPUT_DIR = path.resolve(__dirname, '..', 'img', 'optimized');
const MAP_PATH = path.resolve(__dirname, '..', 'js', 'images-map.json');

const sizes = [320, 640, 960, 1280];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function slugFromFilename(filename) {
  // project-rca.jpg -> rca
  const base = path.parse(filename).name; // project-rca
  const parts = base.split('-');
  return parts.slice(1).join('-') || base;
}

async function processImage(file) {
  const srcPath = path.join(INPUT_DIR, file);
  const slug = slugFromFilename(file);
  const outDir = path.join(OUTPUT_DIR, slug);
  ensureDir(outDir);

  const webpOutputs = [];
  const jpgOutputs = [];

  for (const width of sizes) {
    const webpOut = path.join(outDir, `thumb-${width}.webp`);
    const jpgOut = path.join(outDir, `thumb-${width}.jpg`);
    await sharp(srcPath).resize({ width }).webp({ quality: 78 }).toFile(webpOut);
    await sharp(srcPath).resize({ width }).jpeg({ quality: 78 }).toFile(jpgOut);
    webpOutputs.push({ width, path: webpOut.replace(path.resolve(__dirname, '..'), '') });
    jpgOutputs.push({ width, path: jpgOut.replace(path.resolve(__dirname, '..'), '') });
  }

  // Featured/hero: use larger sizes
  const heroSizes = [640, 960, 1280];
  const heroWebp = [];
  const heroJpg = [];
  for (const width of heroSizes) {
    const webpOut = path.join(outDir, `hero-${width}.webp`);
    const jpgOut = path.join(outDir, `hero-${width}.jpg`);
    await sharp(srcPath).resize({ width }).webp({ quality: 80 }).toFile(webpOut);
    await sharp(srcPath).resize({ width }).jpeg({ quality: 80 }).toFile(jpgOut);
    heroWebp.push({ width, path: webpOut.replace(path.resolve(__dirname, '..'), '') });
    heroJpg.push({ width, path: jpgOut.replace(path.resolve(__dirname, '..'), '') });
  }

  return {
    slug,
    thumb: {
      webp: webpOutputs,
      jpg: jpgOutputs
    },
    hero: {
      webp: heroWebp,
      jpg: heroJpg
    }
  };
}

(async function main() {
  ensureDir(OUTPUT_DIR);
  const files = fs.readdirSync(INPUT_DIR).filter(f => /project-.*\.(jpg|jpeg|png)$/i.test(f));
  const map = {};

  for (const file of files) {
    const info = await processImage(file);
    const slug = info.slug;

    map[slug] = {
      thumb: {
        srcset: info.thumb.webp.map(e => `${e.path} ${e.width}w`).join(', '),
        fallback: info.thumb.jpg[1] ? info.thumb.jpg[1].path : info.thumb.jpg[0].path
      },
      hero: {
        srcset: info.hero.webp.map(e => `${e.path} ${e.width}w`).join(', '),
        fallback: info.hero.jpg[info.hero.jpg.length - 1].path
      }
    };
  }

  fs.writeFileSync(MAP_PATH, JSON.stringify(map, null, 2));
  console.log(`Wrote image map to ${MAP_PATH}`);
})();
