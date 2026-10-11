import { spawnSync } from 'node:child_process';
import { Buffer } from 'node:buffer';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { Document, NodeIO } from '@gltf-transform/core';

const root = fileURLToPath(new URL('../public/client/', import.meta.url));
const cli = fileURLToPath(new URL('../node_modules/@gltf-transform/cli/bin/cli.js', import.meta.url));

const palette = {
  dark: 'rgb(20, 34, 42)',
  deep: 'rgb(36, 55, 61)',
  muted: 'rgb(99, 133, 135)',
  sand: 'rgb(209, 197, 172)',
  pale: 'rgb(241, 236, 222)',
};

function symbol(size, transparent = false) {
  const background = transparent ? '' : `<rect width="${size}" height="${size}" rx="${size * 0.19}" fill="${palette.dark}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
    ${background}
    <circle cx="256" cy="256" r="158" fill="none" stroke="${palette.sand}" stroke-width="21"/>
    <path d="M256 104 386 256 256 408 126 256Z" fill="${palette.muted}"/>
    <path d="M256 104 386 256 256 256Z" fill="${palette.pale}" opacity="0.78"/>
    <path d="M256 256 386 256 256 408Z" fill="${palette.deep}" opacity="0.75"/>
    <circle cx="256" cy="256" r="34" fill="${palette.dark}"/>
  </svg>`;
}

function art(width, height, variant) {
  const tilt = (variant % 5) * 11 - 22;
  const circleX = Math.round(width * (0.26 + (variant % 4) * 0.14));
  const circleY = Math.round(height * (0.36 + (variant % 3) * 0.08));
  const radius = Math.round(Math.min(width, height) * (0.24 + (variant % 3) * 0.045));
  const barX = Math.round(width * (0.61 - (variant % 3) * 0.07));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="bg" x2="1" y2="1"><stop stop-color="${palette.dark}"/><stop offset="0.55" stop-color="${palette.deep}"/><stop offset="1" stop-color="${palette.muted}"/></linearGradient>
      <linearGradient id="orb" x2="1" y2="1"><stop stop-color="${palette.pale}"/><stop offset="0.52" stop-color="${palette.sand}"/><stop offset="1" stop-color="${palette.muted}"/></linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bg)"/>
    <circle cx="${circleX}" cy="${circleY}" r="${radius}" fill="url(#orb)" opacity="0.84"/>
    <circle cx="${circleX}" cy="${circleY}" r="${Math.round(radius * 0.69)}" fill="none" stroke="${palette.dark}" stroke-width="${Math.max(7, Math.round(width * 0.012))}" opacity="0.4"/>
    <g transform="rotate(${tilt} ${barX} ${height / 2})">
      <rect x="${barX}" y="${Math.round(height * -0.15)}" width="${Math.round(width * 0.12)}" height="${Math.round(height * 1.3)}" rx="${Math.round(width * 0.025)}" fill="${palette.pale}" opacity="0.28"/>
      <rect x="${barX + Math.round(width * 0.15)}" y="${Math.round(height * -0.12)}" width="${Math.round(width * 0.05)}" height="${Math.round(height * 1.25)}" fill="${palette.sand}" opacity="0.42"/>
    </g>
    <path d="M0 ${Math.round(height * 0.82)} Q${Math.round(width * 0.35)} ${Math.round(height * 0.63)} ${Math.round(width * 0.7)} ${Math.round(height * 0.9)} T${width} ${Math.round(height * 0.73)} V${height} H0Z" fill="${palette.dark}" opacity="0.5"/>
  </svg>`;
}

function layer(width, height, variant) {
  const upper = variant === 1 ? palette.sand : palette.muted;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <path d="M0 ${Math.round(height * 0.65)} C${Math.round(width * 0.26)} ${Math.round(height * 0.1)} ${Math.round(width * 0.48)} ${Math.round(height * 1.1)} ${width} ${Math.round(height * 0.31)} V${height} H0Z" fill="${upper}" opacity="0.35"/>
    <circle cx="${Math.round(width * 0.78)}" cy="${Math.round(height * 0.28)}" r="${Math.round(height * 0.2)}" fill="${palette.pale}" opacity="0.22"/>
  </svg>`;
}

async function raster(name, width, height, variant, format) {
  const pipeline = sharp(Buffer.from(art(width, height, variant)));
  if (format === 'jpeg') {
    await pipeline.jpeg({ quality: 82, mozjpeg: true }).toFile(join(root, name));
  } else {
    await pipeline.webp({ quality: 79, effort: 6 }).toFile(join(root, name));
  }
}

function addOctahedron(document, buffer, material, up) {
  const positions = [];
  const normals = [];
  const indices = [];
  const points = [
    [0, 1.15, 0],
    [0.83, 0, 0.83],
    [-0.83, 0, 0.83],
    [-0.83, 0, -0.83],
    [0.83, 0, -0.83],
    [0, -1.15, 0],
  ];
  const faces = up
    ? [[0, 2, 1], [0, 3, 2], [0, 4, 3], [0, 1, 4]]
    : [[5, 1, 2], [5, 2, 3], [5, 3, 4], [5, 4, 1]];
  for (const face of faces) {
    const [a, b, c] = face.map((index) => points[index]);
    const ab = b.map((value, index) => value - a[index]);
    const ac = c.map((value, index) => value - a[index]);
    const cross = [
      ab[1] * ac[2] - ab[2] * ac[1],
      ab[2] * ac[0] - ab[0] * ac[2],
      ab[0] * ac[1] - ab[1] * ac[0],
    ];
    const length = Math.hypot(...cross);
    for (const point of [a, b, c]) {
      positions.push(...point);
      normals.push(...cross.map((value) => value / length));
      indices.push(indices.length);
    }
  }
  const position = document.createAccessor().setType('VEC3').setArray(new Float32Array(positions)).setBuffer(buffer);
  const normal = document.createAccessor().setType('VEC3').setArray(new Float32Array(normals)).setBuffer(buffer);
  const index = document.createAccessor().setType('SCALAR').setArray(new Uint16Array(indices)).setBuffer(buffer);
  return document.createPrimitive().setAttribute('POSITION', position).setAttribute('NORMAL', normal).setIndices(index).setMaterial(material);
}

async function model() {
  const document = new Document();
  const buffer = document.createBuffer();
  const light = document.createMaterial().setBaseColorFactor([0.83, 0.77, 0.65, 1]).setMetallicFactor(0.62).setRoughnessFactor(0.31);
  const dark = document.createMaterial().setBaseColorFactor([0.29, 0.44, 0.45, 1]).setMetallicFactor(0.35).setRoughnessFactor(0.42);
  const mesh = document.createMesh()
    .addPrimitive(addOctahedron(document, buffer, light, true))
    .addPrimitive(addOctahedron(document, buffer, dark, false));
  document.createScene().addChild(document.createNode().setMesh(mesh));

  const temp = await mkdtemp(join(tmpdir(), 'landingbuilder-glb-'));
  const source = join(temp, 'model-source.glb');
  try {
    await new NodeIO().write(source, document);
    const result = spawnSync(process.execPath, [cli, 'optimize', source, join(root, 'model.glb'), '--compress', 'meshopt', '--texture-compress', 'webp', '--texture-size', '1024'], { stdio: 'inherit' });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`gltf-transform optimize saiu com codigo ${result.status}`);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
}

await mkdir(root, { recursive: true });
await writeFile(join(root, 'logo.svg'), symbol(512, true));
await writeFile(join(root, 'favicon.svg'), symbol(512));
await writeFile(join(root, 'layer-1.svg'), layer(1600, 900, 1));
await writeFile(join(root, 'layer-2.svg'), layer(1600, 900, 2));
await sharp(Buffer.from(symbol(512))).png().toFile(join(root, 'logo-face.png'));
await raster('og.jpg', 1200, 630, 0, 'jpeg');
await raster('model-poster.webp', 1440, 900, 1, 'webp');
await raster('showcase-poster.webp', 1440, 900, 2, 'webp');
await raster('about.webp', 1600, 1000, 3, 'webp');
await raster('about-800.webp', 800, 500, 3, 'webp');
for (let index = 1; index <= 3; index++) {
  await raster(`feature-${index}.webp`, 960, 720, index + 3, 'webp');
}
for (let index = 1; index <= 5; index++) {
  await raster(`gallery-${index}.webp`, 1200, 800, index + 6, 'webp');
}
await model();
console.log('Placeholders gerados em public/client.');
