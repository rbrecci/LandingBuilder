import { describe, expect, it } from 'vitest'
import type { Content } from '../../src/content/schema.ts'
import { joinBase, withBase } from '../../src/content/withBase.ts'

describe('joinBase', () => {
  it('mantem caminhos locais quando o base e /', () => {
    expect(joinBase('/client/a.webp', '/')).toBe('/client/a.webp')
  })

  it.each(['/LandingBuilder/', '/sub/pasta/'])('prefixa caminhos locais com base %s', (base) => {
    expect(joinBase('/client/a.webp', base)).toBe(`${base.slice(0, -1)}/client/a.webp`)
  })

  it.each([
    'https://x/client/a.webp',
    'tel:+5511900000000',
    '#contato',
    'mailto:a@b.c',
    'wa:5511900000000',
    '',
    '/',
    '//cdn/client/a.webp',
  ])('mantem o caminho externo ou nao local %s', (path) => {
    expect(joinBase(path, '/LandingBuilder/')).toBe(path)
  })
})

describe('withBase', () => {
  const content = {
    site: { favicon: '/client/favicon.svg', external: 'https://x/client/a.webp' },
    sections: [{ data: { images: [{ src: '/client/a.webp' }] } }],
    untouched: { value: 42 },
  } as unknown as Content

  it('prefixa strings aninhadas em arrays e objetos sem mutar a entrada', () => {
    const original = structuredClone(content)
    const result = withBase(content, '/LandingBuilder/')

    expect(result.sections[0]).toMatchObject({ data: { images: [{ src: '/LandingBuilder/client/a.webp' }] } })
    expect(content).toEqual(original)
  })

  it('preserva todos os campos em base raiz', () => {
    expect(withBase(content, '/')).toEqual(content)
  })
})
