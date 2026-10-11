import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const docPaths = ['README.md', 'docs/CUSTOMIZACAO.md']

describe('documentação de customização', () => {
  const documents = docPaths.map((path) => ({ path, text: readFileSync(resolve(root, path), 'utf8') }))
  const combined = documents.map(({ text }) => text).join('\n')

  it('cita apenas scripts npm existentes', () => {
    const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }
    const commands = [...combined.matchAll(/\bnpm run ([\w:-]+)/g)].map((match) => match[1])
    expect(commands.length).toBeGreaterThan(0)
    for (const command of commands) expect(packageJson.scripts).toHaveProperty(command)
  })

  it('cita caminhos locais existentes', () => {
    const paths = [...combined.matchAll(/`((?:src|client|scripts|docs|public|\.claude)\/[^`]+)`/g)]
      .map((match) => match[1])
    expect(paths.length).toBeGreaterThan(0)
    for (const path of paths) expect(existsSync(resolve(root, path)), path).toBe(true)
  })

  it('preserva o crédito, o destino GitHub e não usa pontuação proibida', () => {
    expect(documents[0].text).toContain('https://github.com/rbrecci')
    expect(combined).toContain('Desenvolvido por RBrecci')
    const forbidden = new Set([0x2014, 0x2013, 0x2212])
    for (const { path, text } of documents) {
      const invalid = [...text].filter((character) => forbidden.has(character.codePointAt(0)!))
      expect(invalid, path).toEqual([])
    }
  })
})
