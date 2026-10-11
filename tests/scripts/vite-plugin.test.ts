import { resolve } from 'node:path'
import type { HmrContext, ModuleNode, ViteDevServer } from 'vite'
import { describe, expect, it, vi } from 'vitest'
import clientPlugin from '../../scripts/vite-plugin-client.ts'

const theme = {
  colors: {
    paper: '#FFFFFF', ink: '#111111', brand: '#1A3A6B', brandContrast: '#FFFFFF',
    accent: '#A0290C', accentContrast: '#FFFFFF', focus: '#FFFF00',
    surfaces: {
      dark: { bg: '#111111', fg: '#FFFFFF' },
      light: { bg: '#FFFFFF', fg: '#111111' },
      brand: { bg: '#1A3A6B', fg: '#FFFFFF' },
      accent: { bg: '#A0290C', fg: '#FFFFFF' },
    },
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
  return hook.call({} as ThisParameterType<typeof hook>, html, {} as Parameters<typeof hook>[1])
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

  it('expõe conteúdo validado com defaults no módulo virtual', async () => {
    const plugin = clientPlugin({ content, theme })
    const resolveId = plugin.resolveId as (id: string) => string | undefined
    const load = plugin.load as (id: string) => Promise<string | undefined>
    const id = resolveId('virtual:client-content')
    expect(id).toBe('\0virtual:client-content')

    const source = await load(id as string)
    expect(source).toMatch(/^export default /)
    const parsed = JSON.parse(source!.slice('export default '.length))
    expect(parsed).toMatchObject({
      site: { indexable: false },
      business: { social: [], hoursConfirmed: false },
      sections: [{
        id: 'hero', enabled: true, tone: 'light', placeholder: false,
        data: { layers: [], status: false, model: { interaction: 'both', mobile: 'scroll', maxTiltDeg: 18 } },
      }],
    })
  })

  it('rejeita conteúdo inválido ao carregar o módulo virtual', async () => {
    const plugin = clientPlugin({ content: { ...content, site: { ...content.site, title: '' } }, theme })
    const resolveId = plugin.resolveId as (id: string) => string | undefined
    const load = plugin.load as (id: string) => Promise<string | undefined>

    await expect(load(resolveId('virtual:client-content') as string)).rejects.toThrow('content.site.title')
  })

  it('observa content.json e invalida o módulo virtual quando ele muda', () => {
    const plugin = clientPlugin({ content, theme })
    const contentPath = resolve(process.cwd(), 'client', 'content.json')
    const virtualModule = { id: '\0virtual:client-content' } as ModuleNode
    const add = vi.fn()
    const getModuleById = vi.fn().mockReturnValue(virtualModule)
    const invalidateModule = vi.fn()
    const server = {
      watcher: { add },
      moduleGraph: { getModuleById, invalidateModule },
    } as unknown as ViteDevServer
    const configureServer = plugin.configureServer as (server: ViteDevServer) => void
    const handleHotUpdate = plugin.handleHotUpdate as (ctx: HmrContext) => ModuleNode[] | void

    configureServer(server)
    expect(add).toHaveBeenCalledWith(contentPath)

    const context: HmrContext = { file: contentPath, timestamp: 123, modules: [], read: () => '', server }
    expect(handleHotUpdate(context)).toEqual([virtualModule])
    expect(getModuleById).toHaveBeenCalledWith('\0virtual:client-content')
    expect(invalidateModule).toHaveBeenCalledWith(virtualModule, undefined, 123, true)
    expect(handleHotUpdate({ ...context, file: resolve(process.cwd(), 'client', 'theme.json') })).toBeUndefined()
    expect(invalidateModule).toHaveBeenCalledTimes(1)
  })

  it('aponta o caminho do campo inválido', async () => {
    await expect(transform({ ...content, site: { ...content.site, title: '' } }))
      .rejects.toThrow('content.site.title')
  })
})
