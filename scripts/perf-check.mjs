import { spawn } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo']
const TRANSFER_LIMIT = 600_000
const PREVIEW_URL = 'http://127.0.0.1:4173/'

export function evaluateScores(scores, minimum, indexable = false) {
  return CATEGORIES.every((category) => {
    if (category === 'seo' && !indexable) return true
    const threshold = minimum ?? (category === 'performance' ? 75 : 90)
    return Number.isFinite(scores[category]) && scores[category] >= threshold
  })
}

export function measureTransfer(report, ignoredFiles = new Set()) {
  const requests = report.audits?.['network-requests']?.details?.items
  if (!Array.isArray(requests)) throw new Error('Relatório sem lista de requisições de rede')
  return requests.reduce((bytes, request) => {
    const path = new URL(request.url).pathname
    if ([...ignoredFiles].some((file) => path.endsWith(`/${file}`))) return bytes
    return bytes + (request.transferSize ?? 0)
  }, 0)
}

export function evaluateTransfer(bytes) {
  return bytes <= TRANSFER_LIMIT
}

function threeFiles(dist) {
  const manifest = JSON.parse(readFileSync(resolve(dist, '.vite/manifest.json'), 'utf8'))
  const scene = manifest['src/three/Scene.tsx']
  if (!scene) return new Set()

  const initial = new Set()
  const collect = (key, files) => {
    const chunk = manifest[key]
    if (!chunk || files.has(chunk.file)) return
    files.add(chunk.file)
    for (const dependency of chunk.imports ?? []) collect(dependency, files)
  }
  for (const [key, chunk] of Object.entries(manifest)) {
    if (chunk.isEntry) collect(key, initial)
  }

  const dynamic = new Set()
  collect('src/three/Scene.tsx', dynamic)
  return new Set([...dynamic].filter((file) => !initial.has(file)))
}

function printHelp() {
  console.log('Uso: node scripts/perf-check.mjs [--url URL] [--min 90]')
  console.log('Sem --url, inicia vite preview na porta 4173. Mede Lighthouse mobile e a primeira carga.')
}

function parseArgs(args) {
  const options = { url: undefined, minimum: undefined, help: false }
  for (let i = 0; i < args.length; i++) {
    const [name, inlineValue] = args[i].split('=', 2)
    if (name === '--help' || name === '-h') {
      options.help = true
      continue
    }
    if (name !== '--url' && name !== '--min') throw new Error(`Argumento inválido: ${args[i]}`)
    const value = inlineValue ?? args[++i]
    if (!value) throw new Error(`Valor ausente para ${name}`)
    if (name === '--url') options.url = new URL(value).href
    else {
      options.minimum = Number(value)
      if (!Number.isFinite(options.minimum) || options.minimum < 0 || options.minimum > 100) {
        throw new Error('--min deve estar entre 0 e 100')
      }
    }
  }
  return options
}

async function waitForPreview(child) {
  const deadline = Date.now() + 20_000
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`vite preview encerrou com código ${child.exitCode}`)
    try {
      const response = await fetch(PREVIEW_URL)
      if (response.ok) return
    } catch {
      // O servidor ainda está iniciando.
    }
    await new Promise((done) => setTimeout(done, 250))
  }
  throw new Error('vite preview não respondeu na porta 4173 em 20 segundos')
}

function runLighthouse(url, reportPath, chromePath) {
  return new Promise((done, reject) => {
    const args = [
      resolve('node_modules/lighthouse/cli/index.js'), url,
      '--form-factor=mobile',
      '--only-categories=performance,accessibility,best-practices,seo',
      '--output=json', `--output-path=${reportPath}`,
      '--chrome-flags=--headless=new --no-sandbox',
    ]
    const child = spawn(process.execPath, args, {
      stdio: 'inherit',
      env: { ...process.env, CHROME_PATH: chromePath },
    })
    child.on('error', reject)
    child.on('close', (code) => code === 0 ? done() : reject(new Error(`Lighthouse saiu com código ${code}`)))
  })
}

async function main(args) {
  const options = parseArgs(args)
  if (options.help) return printHelp()

  const { chromium } = await import('@playwright/test')
  const directory = mkdtempSync(resolve(tmpdir(), 'landing-lighthouse-'))
  let preview
  try {
    const url = options.url ?? PREVIEW_URL
    if (!options.url) {
      preview = spawn(process.execPath, [resolve('node_modules/vite/bin/vite.js'), 'preview', '--port', '4173', '--strictPort', '--host', '127.0.0.1'], { stdio: 'inherit' })
      await waitForPreview(preview)
    }

    const reportPath = resolve(directory, 'report.json')
    await runLighthouse(url, reportPath, chromium.executablePath())
    const report = JSON.parse(readFileSync(reportPath, 'utf8'))
    const scores = Object.fromEntries(CATEGORIES.map((category) => [category, (report.categories?.[category]?.score ?? NaN) * 100]))
    const content = JSON.parse(readFileSync(resolve('client/content.json'), 'utf8'))
    const indexable = content.site.indexable === true
    const transferBytes = measureTransfer(report, threeFiles('dist'))

    console.log('Lighthouse mobile:')
    for (const category of CATEGORIES) {
      const ignored = category === 'seo' && !indexable ? ' (informativo: site não indexável)' : ''
      console.log(`${category}: ${Number.isFinite(scores[category]) ? scores[category].toFixed(1) : 'indisponível'}${ignored}`)
    }
    console.log(`Primeira carga sem chunk 3D: ${transferBytes} bytes (limite ${TRANSFER_LIMIT})`)
    if (!evaluateScores(scores, options.minimum, indexable) || !evaluateTransfer(transferBytes)) process.exitCode = 1
  } finally {
    preview?.kill()
    rmSync(directory, { recursive: true, force: true })
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}
