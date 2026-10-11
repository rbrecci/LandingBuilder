import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

export const LIMITS = { initialBytes: 100_000, sceneBytes: 270_000 }

export function measureSizes(dist = 'dist') {
  const manifest = JSON.parse(readFileSync(resolve(dist, '.vite/manifest.json'), 'utf8'))
  const entry = Object.values(manifest).find((chunk) => chunk.isEntry && chunk.file.endsWith('.js'))
  const scene = manifest['src/three/Scene.tsx']
  if (!entry) throw new Error('Manifesto sem entrada JavaScript')
  if (!scene?.isDynamicEntry) throw new Error('Manifesto sem chunk dinâmico src/three/Scene.tsx')

  const visited = new Set()
  function gzipChunk(chunk) {
    if (visited.has(chunk.file)) return 0
    visited.add(chunk.file)
    return gzipSync(readFileSync(resolve(dist, chunk.file))).length
  }

  function sumStatic(chunk) {
    let bytes = gzipChunk(chunk)
    for (const key of chunk.imports ?? []) {
      if (!manifest[key]) throw new Error(`Import estático ausente no manifesto: ${key}`)
      if (!visited.has(manifest[key].file)) bytes += sumStatic(manifest[key])
    }
    return bytes
  }

  function sumReachable(chunk) {
    let bytes = sumStatic(chunk)
    for (const key of chunk.dynamicImports ?? []) {
      if (!manifest[key]) throw new Error(`Missing dynamic import in manifest: ${key}`)
      if (!visited.has(manifest[key].file)) bytes += sumReachable(manifest[key])
    }
    return bytes
  }

  const initialBytes = sumStatic(entry)
  const sceneBytes = sumReachable(scene)

  return { initialBytes, sceneBytes }
}

export function evaluateBudget(sizes, limits = LIMITS) {
  return sizes.initialBytes <= limits.initialBytes && sizes.sceneBytes <= limits.sceneBytes
}

function printHelp() {
  console.log('Uso: node scripts/size-budget.mjs [--dist dist]')
  console.log('Compara JS inicial com 100 kB gzip e Scene.tsx com 270 kB gzip (1 kB = 1000 bytes).')
}

function main(args) {
  let dist = 'dist'
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--help' || args[i] === '-h') return printHelp()
    if (args[i] === '--dist' && args[i + 1]) dist = args[++i]
    else if (args[i].startsWith('--dist=')) dist = args[i].slice('--dist='.length)
    else throw new Error(`Argumento inválido: ${args[i]}`)
  }

  const sizes = measureSizes(dist)
  console.log('Recurso       Gzip (kB)  Limite (kB)  Resultado')
  for (const [label, bytes, limit] of [
    ['JS inicial', sizes.initialBytes, LIMITS.initialBytes],
    ['Scene completa', sizes.sceneBytes, LIMITS.sceneBytes],
  ]) {
    console.log(`${label.padEnd(13)} ${(bytes / 1000).toFixed(2).padStart(9)} ${String(limit / 1000).padStart(12)}  ${bytes <= limit ? 'OK' : 'ACIMA'}`)
  }
  if (!evaluateBudget(sizes)) process.exitCode = 1
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  try {
    main(process.argv.slice(2))
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  }
}
