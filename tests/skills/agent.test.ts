import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const agent = readFileSync('.claude/agents/landing-cliente.md', 'utf8')
const [opening, ...rest] = agent.split(/\r?\n/)
const closing = rest.indexOf('---')
const frontmatter = rest.slice(0, closing).join('\n')
const body = rest.slice(closing + 1).join('\n')

describe('agente landing-cliente', () => {
  it('abre com frontmatter valido e configuracao restrita', () => {
    expect(opening).toBe('---')
    expect(closing).toBeGreaterThan(-1)
    expect(frontmatter).toMatch(/^name: landing-cliente$/m)
    expect(frontmatter).toMatch(/^description: .+$/m)
    expect(frontmatter).toMatch(/^model: sonnet$/m)
    expect(frontmatter).toMatch(/^maxTurns: 40$/m)
    expect(frontmatter).toMatch(/^skills: landing-cliente$/m)

    const tools = frontmatter.match(/^tools: (.+)$/m)?.[1]?.split(',').map((tool) => tool.trim())
    expect(tools).toEqual(['Read', 'Edit', 'Write', 'Glob', 'Grep', 'Bash'])
  })

  it('explica quando delegar e como lidar com briefing incompleto', () => {
    expect(frontmatter).toMatch(/criar|cria/i)
    expect(frontmatter).toMatch(/ajustar|ajusta/i)
    expect(frontmatter).toMatch(/conte[uú]do/i)
    expect(frontmatter).toMatch(/checagens|validar|valida[cç][oõ]es/i)
    expect(body).toMatch(/perguntas/i)
    expect(body).toMatch(/n[aã]o inventar dados do cliente/i)
  })

  it('limita arquivos, verifica em laco e define o relatorio', () => {
    for (const path of ['client/content.json', 'client/theme.json', 'public/client/', 'docs/ASSETS.md']) {
      expect(body).toContain(path)
    }
    for (const command of ['validate', 'check:text', 'build', 'size', 'e2e']) {
      expect(body).toContain(`npm run ${command}`)
    }
    expect(body).toMatch(/25 linhas/)
    expect(body).toMatch(/c[oó]digo de sa[ií]da/i)
    expect(body).toMatch(/a confirmar/i)
    expect(body).toMatch(/n[aã]o verificados/i)
  })

  it('nao contem sinais tipograficos proibidos', () => {
    expect(agent).not.toMatch(/[\u2014\u2013\u2212]/u)
  })
})
