import { readdir, stat } from 'node:fs/promises';
import { join, extname, basename, resolve } from 'node:path';
import process from 'node:process';
import sharp from 'sharp';

const folder = process.argv[2];
if (!folder) {
  console.error('Uso: npm run assets:optimize -- <pasta>');
  process.exitCode = 1;
} else {
  const source = resolve(folder);
  const files = [];

  async function collect(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        await collect(path);
      } else if (entry.isFile()) {
        const extension = extname(entry.name).toLowerCase();
        const stem = basename(entry.name, extension);
        if (['.jpg', '.jpeg', '.png', '.webp'].includes(extension) && !stem.endsWith('-800')) {
          files.push({ path, directory, stem, extension });
        }
      }
    }
  }

  const info = await stat(source);
  if (!info.isDirectory()) throw new Error(`Nao e uma pasta: ${source}`);
  await collect(source);

  let generated = 0;
  for (const file of files) {
    const metadata = await sharp(file.path).metadata();
    if (file.extension !== '.webp') {
      await sharp(file.path).rotate().webp({ quality: 80, effort: 6 }).toFile(join(file.directory, `${file.stem}.webp`));
      generated++;
    }
    const displayedWidth = [5, 6, 7, 8].includes(metadata.orientation) ? metadata.height : metadata.width;
    if (displayedWidth > 800) {
      await sharp(file.path).rotate().resize({ width: 800, withoutEnlargement: true }).webp({ quality: 80, effort: 6 }).toFile(join(file.directory, `${file.stem}-800.webp`));
      generated++;
    }
  }
  console.log(`${generated} arquivo(s) WebP gerado(s) a partir de ${files.length} imagem(ns).`);
}
