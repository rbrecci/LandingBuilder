import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, describe, expect, it } from 'vitest'
import { loadContent, loadTheme } from '../../src/content/load.ts'

const root = fileURLToPath(new URL('../../', import.meta.url))
const fixture = (name: string, file: string) => resolve(root, 'tests/fixtures', name, file)
const run = (script: string, ...args: string[]) => spawnSync(process.execPath, [resolve(root, 'scripts', script), ...args], {
  cwd: root,
  encoding: 'utf8',
})
const temporary = mkdtempSync(resolve(tmpdir(), 'landing-validation-'))

afterAll(() => rmSync(temporary, { recursive: true, force: true }))

describe('carregamento e validação do cliente', () => {
  it('carrega os dois documentos válidos', () => {
    const content = loadContent(JSON.parse(readFileSync(fixture('valid', 'content.json'), 'utf8')))
    const theme = loadTheme(JSON.parse(readFileSync(fixture('valid', 'theme.json'), 'utf8')))
    expect(content.sections[0].type).toBe('hero')
    expect(theme.fonts.body).toBeTruthy()
  })

  it('mostra o caminho de um campo inválido', () => {
    expect(() => loadTheme({ colors: {} })).toThrow(/colors/)
  })

  it('aceita o diretório válido', () => {
    const result = run('validate-client.ts', '--dir', 'tests/fixtures/valid')
    expect(result.status).toBe(0)
  })

  it('recusa contraste insuficiente', () => {
    const result = run('validate-client.ts', '--dir', 'tests/fixtures/invalid-contrast')
    expect(result.status).toBe(1)
    expect(result.stderr + result.stdout).toMatch(/contraste/i)
  })

  it('cita o destino de link inexistente', () => {
    const result = run('validate-client.ts', '--dir', 'tests/fixtures/invalid-link')
    expect(result.status).toBe(1)
    expect(result.stderr + result.stdout).toContain('id-inexistente')
  })

  it('recusa src local ausente', () => {
    const content = JSON.parse(readFileSync(fixture('valid', 'content.json'), 'utf8'))
    content.site.ogImage = '/client/arquivo-ausente.webp'
    const directory = resolve(temporary, 'missing-src')
    mkdirFixture(directory, content)
    const result = run('validate-client.ts', '--dir', directory)
    expect(result.status).toBe(1)
    expect(result.stderr + result.stdout).toContain('arquivo-ausente.webp')
  })

  it('recusa mais de oito elementos com parallax', () => {
    const content = JSON.parse(readFileSync(fixture('valid', 'content.json'), 'utf8'))
    const hero = content.sections[0]
    hero.data.layers = Array.from({ length: 3 }, () => ({ src: '/client/layer-1.svg', speed: 0.2 }))
    const types = ['stats', 'about', 'features', 'showcase3d', 'gallery', 'offers']
    for (const type of types) {
      const section = content.sections.find((item: { type: string }) => item.type === type)
      section.parallax = 'subtle'
    }
    const directory = resolve(temporary, 'too-much-parallax')
    mkdirFixture(directory, content)
    const result = run('validate-client.ts', '--dir', directory)
    expect(result.status).toBe(1)
    expect(result.stderr + result.stdout).toMatch(/parallax/i)
  })

  it('detecta texto proibido e aceita fixtures limpas', () => {
    const file = resolve(temporary, 'bad.md')
    writeFileSync(file, `linha limpa\ntexto ${String.fromCharCode(0x2014)} inválido\n`)
    const bad = run('check-text.ts', temporary)
    expect(bad.status).toBe(1)
    expect(bad.stdout).toContain('bad.md:2')
    const good = run('check-text.ts', 'tests/fixtures')
    expect(good.status).toBe(0)
  })
})

function mkdirFixture(directory: string, content: unknown) {
  mkdirSync(directory, { recursive: true })
  writeFileSync(resolve(directory, 'content.json'), JSON.stringify(content))
  copyFileSync(fixture('valid', 'theme.json'), resolve(directory, 'theme.json'))
}
