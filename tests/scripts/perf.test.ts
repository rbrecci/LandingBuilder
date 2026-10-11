import { spawnSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { gzipSync } from 'node:zlib'
import { afterAll, describe, expect, it } from 'vitest'

const root = process.cwd()
const temporary = mkdtempSync(resolve(tmpdir(), 'landing-perf-'))
const dist = resolve(temporary, 'dist')
const assets = resolve(dist, 'assets')

mkdirSync(resolve(dist, '.vite'), { recursive: true })
mkdirSync(assets, { recursive: true })
copyFileSync(resolve(root, 'tests/fixtures/manifest/manifest.json'), resolve(dist, '.vite/manifest.json'))
const manifestPath = resolve(dist, '.vite/manifest.json')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Record<string, {
  file?: string
  imports?: string[]
  dynamicImports?: string[]
  isEntry?: boolean
  isDynamicEntry?: boolean
  src?: string
}>
manifest['src/three/Scene.tsx']!.dynamicImports = ['assets/scene-dynamic.js']
manifest['assets/scene-dynamic.js'] = {
  file: 'assets/scene-dynamic.js',
  imports: ['assets/shared.js'],
}
writeFileSync(manifestPath, JSON.stringify(manifest))

const entry = Buffer.from('entry '.repeat(100))
const shared = Buffer.from('shared '.repeat(100))
const scene = Buffer.from('scene '.repeat(100))
const sceneDependency = randomBytes(270_000)
const sceneLeaf = Buffer.from('leaf '.repeat(100))
const sceneDynamic = randomBytes(25_000)
writeFileSync(resolve(assets, 'index.js'), entry)
writeFileSync(resolve(assets, 'shared.js'), shared)
writeFileSync(resolve(assets, 'scene.js'), scene)
writeFileSync(resolve(assets, 'scene-dep.js'), sceneDependency)
writeFileSync(resolve(assets, 'scene-leaf.js'), sceneLeaf)
writeFileSync(resolve(assets, 'scene-dynamic.js'), sceneDynamic)

afterAll(() => rmSync(temporary, { recursive: true, force: true }))

type Sizes = { initialBytes: number; sceneBytes: number }
type Scores = { performance: number; accessibility: number; 'best-practices': number; seo: number }

describe('orçamento de tamanho e Lighthouse', () => {
  it('soma imports estáticos transitivos da Scene sem repetir o chunk inicial', async () => {
    const { measureSizes, evaluateBudget } = await import(pathToFileURL(resolve(root, 'scripts/size-budget.mjs')).href) as {
      measureSizes: (directory: string) => Sizes
      evaluateBudget: (sizes: Sizes) => boolean
    }
    const sizes = measureSizes(dist)
    expect(sizes).toEqual({
      initialBytes: gzipSync(entry).length + gzipSync(shared).length,
      sceneBytes: gzipSync(scene).length + gzipSync(sceneDependency).length + gzipSync(sceneLeaf).length +
        gzipSync(sceneDynamic).length,
    })
    expect(evaluateBudget(sizes)).toBe(false)
    const result = spawnSync(process.execPath, [resolve(root, 'scripts/size-budget.mjs'), '--dist', dist], {
      cwd: root,
      encoding: 'utf8',
    })
    expect(result.status).toBe(1)
    expect(result.stdout).toContain('ACIMA')
  })

  it('aprova o limite exato de 270 kB para Scene e reprova um byte acima', async () => {
    const { evaluateBudget } = await import(pathToFileURL(resolve(root, 'scripts/size-budget.mjs')).href) as {
      evaluateBudget: (sizes: Sizes) => boolean
    }
    expect(evaluateBudget({ initialBytes: 100_000, sceneBytes: 270_000 })).toBe(true)
    expect(evaluateBudget({ initialBytes: 100_000, sceneBytes: 270_001 })).toBe(false)
  })

  it('usa metas distintas para desempenho e as outras categorias', async () => {
    const { evaluateScores } = await import(pathToFileURL(resolve(root, 'scripts/perf-check.mjs')).href) as {
      evaluateScores: (scores: Scores, minimum?: number, indexable?: boolean) => boolean
    }
    const scores: Scores = { performance: 75, accessibility: 90, 'best-practices': 90, seo: 90 }
    expect(evaluateScores(scores, undefined, true)).toBe(true)
    expect(evaluateScores({ ...scores, performance: 74 }, undefined, true)).toBe(false)
    expect(evaluateScores({ ...scores, accessibility: 89 }, undefined, true)).toBe(false)
    expect(evaluateScores({ ...scores, seo: 89 }, undefined, true)).toBe(false)
    expect(evaluateScores({ ...scores, seo: 89 }, undefined, false)).toBe(true)
    expect(evaluateScores(scores, 85, true)).toBe(false)
  })

  it('conta bytes transferidos sem o chunk 3D e respeita 600 kB', async () => {
    const { measureTransfer, evaluateTransfer } = await import(pathToFileURL(resolve(root, 'scripts/perf-check.mjs')).href) as {
      measureTransfer: (report: unknown, ignoredFiles: Set<string>) => number
      evaluateTransfer: (bytes: number) => boolean
    }
    const report = { audits: { 'network-requests': { details: { items: [
      { url: 'https://example.com/demo/assets/index.js', transferSize: 400_000 },
      { url: 'https://example.com/demo/assets/scene.js', transferSize: 200_000 },
      { url: 'https://example.com/demo/image.webp', transferSize: 200_000 },
    ] } } } }
    expect(measureTransfer(report, new Set(['assets/scene.js']))).toBe(600_000)
    expect(evaluateTransfer(600_000)).toBe(true)
    expect(evaluateTransfer(600_001)).toBe(false)
  })

  it('oferece ajuda sem iniciar o Lighthouse', () => {
    const result = spawnSync(process.execPath, [resolve(root, 'scripts/perf-check.mjs'), '--help'], {
      cwd: root,
      encoding: 'utf8',
    })
    expect(result.status).toBe(0)
    expect(result.stdout).toContain('--url')
    expect(result.stdout).toContain('--min')
  })
})
