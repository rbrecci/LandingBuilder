import { describe, expect, it } from 'vitest'
import clientPlugin from '../../scripts/vite-plugin-client.ts'

const theme = {
  colors: {
    paper: '#FFFFFF', ink: '#111111', brand: '#1A3A6B', brandContrast: '#FFFFFF',
    accent: '#A0290C', accentContrast: '#FFFFFF', focus: '#FFFF00',
  },
  surfaces: {
    dark: { bg: '#111111', fg: '#FFFFFF' },
    light: { bg: '#FFFFFF', fg: '#111111' },
    brand: { bg: '#1A3A6B', fg: '#FFFFFF' },
    accent: { bg: '#A0290C', fg: '#FFFFFF' },
  },
  fonts: { display: 'outfit', body: 'dm-sans' },
  radius: 'md',
  density: 'regular',
  motion: { level: 'subtle', parallaxRangePx: 24 },
  three: { ambient: '#FFFFFF', key: '#FFFFFF', fill: '#FFFFFF' },
}

const content = {
  schemaVersion: 1,
  site: {
    lang: 'pt-BR',
    title: 'Exemplo de página da marca',
    description: 'Uma página de exemplo para testar os metadados gerados pelo plugin do cliente.',
    url: 'https://exemplo.com/',
    indexable: false,
    ogImage: '/client/capa.webp',
    favicon: '/client/favicon.svg',
    demoBanner: { enabled: false, text: 'Demonstração' },
  },
  brand: {
    name: 'Marca Exemplo', shortName: 'Exemplo', tagline: 'Uma marca de exemplo',
    logo: { src: '/client/logo.svg', alt: 'Marca Exemplo', width: 100, height: 100 },
  },
  business: {
    schemaType: 'LocalBusiness',
    address: {
      street: 'Rua Exemplo, 10', district: 'Centro', city: 'São Paulo',
      region: 'SP', postalCode: '01000-000', country: 'BR',
    },
    phone: '+5511999999999', timezone: 'America/Sao_Paulo',
    hours: [{ day: 1, opens: '09:00', closes: '18:00' }],
    hoursConfirmed: false,
  },
  nav: { cta: { label: 'Conheça', to: '#hero' } },
  sections: [{
    type: 'hero', title: 'Boas-vindas',
    data: {
      headline: 'Olá', subheadline: 'Bem-vindo à página.',
      ctas: [{ label: 'Conheça', to: '#hero', variant: 'primary' }],
      model: {
        kind: 'glb', poster: { src: '/client/poster.webp', alt: 'Modelo', width: 800, height: 800 },
        alt: 'Modelo', glb: { src: '/client/model.glb', scale: 1, rotation: [0, 0, 0] },
      },
    },
  }],
  footer: { links: [] },
}

const html = '<!doctype html><html lang="pt-BR"><head><!--head-meta--><title>Modelo de landing page</title></head><body></body></html>'

async function transform(contentInput: unknown = content, themeInput: unknown = theme) {
  const hook = clientPlugin({ content: contentInput, theme: themeInput }).transformIndexHtml
  if (typeof hook !== 'function') throw new Error('Hook transformIndexHtml ausente')
  return hook(html, {} as Parameters<typeof hook>[1])
}

describe('clientPlugin', () => {
  it('gera metadados e oculta dados não confirmados', async () => {
    const result = await transform()
    expect(result).toContain('<meta name="robots" content="noindex, nofollow">')
    expect(result).toContain('<link rel="canonical" href="https://exemplo.com/">')
    expect(result).toContain('<meta name="theme-color" content="#1A3A6B">')
    expect(result).not.toContain('<title>Modelo de landing page</title>')
    expect(result).toContain('<style id="theme-vars">')
    expect(result).toContain('--color-brand:')
    expect(result).not.toContain('"telephone"')
    expect(result).not.toContain('"openingHoursSpecification"')
    expect(result).toContain('"@type":"LocalBusiness"')
    expect(result).toContain('"streetAddress":"Rua Exemplo, 10"')
  })

  it('não gera noindex quando o site é indexável e inclui horários confirmados', async () => {
    const result = await transform({
      ...content,
      site: { ...content.site, indexable: true },
      business: { ...content.business, hoursConfirmed: true },
    })
    expect(result).not.toContain('name="robots"')
    expect(result).toContain('"telephone":"+5511999999999"')
    expect(result).toContain('"openingHoursSpecification"')
  })

  it('importa os CSS das duas fontes escolhidas no módulo virtual', async () => {
    const plugin = clientPlugin({ content, theme })
    const resolveId = plugin.resolveId as (id: string) => string | undefined
    const load = plugin.load as (id: string) => Promise<string | undefined>
    const id = resolveId('virtual:client-fonts')
    expect(id).toBe('\0virtual:client-fonts')
    const source = await load(id as string)
    expect(source?.trim().split('\n')).toEqual([
      "import '@fontsource-variable/outfit/wght.css'",
      "import '@fontsource-variable/dm-sans/wght.css'",
    ])
  })

  it('aponta o caminho do campo inválido', async () => {
    await expect(transform({ ...content, site: { ...content.site, title: '' } }))
      .rejects.toThrow('content.site.title')
  })
})
