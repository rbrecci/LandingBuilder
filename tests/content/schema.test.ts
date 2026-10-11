import { describe, expect, it } from 'vitest'
import { contentSchema } from '../../src/content/schema.ts'

const image = { src: '/client/image.webp', alt: 'Imagem de exemplo', width: 800, height: 800 }
const model = {
  kind: 'medal',
  medal: { texture: '/client/face.webp', thickness: 0.16 },
  poster: image,
  alt: 'Medalha de exemplo',
}

function validContent() {
  return {
    schemaVersion: 1,
    site: {
      lang: 'pt-BR',
      title: 'Casa Exemplo | Experiências especiais',
      description: 'Uma experiência de exemplo para apresentar serviços, espaços e formas de contato.',
      indexable: false,
      ogImage: '/client/og.jpg',
      favicon: '/client/favicon.svg',
      demoBanner: { enabled: true, text: 'Site de demonstração' },
    },
    brand: { name: 'Casa Exemplo', shortName: 'Exemplo', tagline: 'Um lugar especial', logo: image },
    nav: { cta: { label: 'Contato', to: '#hero' } },
    sections: [{ type: 'hero', title: 'Bem-vindo à Casa Exemplo', data: {
      headline: 'Venha conhecer a Casa Exemplo', subheadline: 'Uma experiência feita para você',
      ctas: [{ label: 'Começar', to: '#hero', variant: 'primary' }], model, layers: [], status: false,
    } }],
    footer: { links: [{ label: 'Início', to: '#hero' }] },
  }
}

function section(type: string, items?: unknown[]) {
  const data: Record<string, unknown> = {
    stats: { items: items ?? [{ value: '10', label: 'Projetos' }, { value: '20', label: 'Clientes' }] },
    about: { paragraphs: ['Sobre nós'], image },
    features: { items: items ?? Array.from({ length: 3 }, (_, i) => ({ title: `Recurso ${i}`, text: 'Descrição' })) },
    showcase3d: { model: { ...model, kind: 'glb', glb: { src: '/client/model.glb', scale: 1, rotation: [0, 0, 0] } }, caption: 'Modelo', controls: true },
    gallery: { items: items ?? Array.from({ length: 3 }, () => ({ ...image, caption: 'Legenda' })) },
    offers: { items: items ?? [{ name: 'Oferta A', price: 'R$ 10', unit: 'un' }, { name: 'Oferta B', price: 'R$ 20', unit: 'un' }], note: 'Valores ilustrativos' },
    testimonials: { items: items ?? [{ quote: 'Muito bom', author: 'Cliente A' }, { quote: 'Excelente', author: 'Cliente B' }], consentConfirmed: true },
    faq: { items: items ?? Array.from({ length: 3 }, (_, i) => ({ question: `Pergunta ${i}?`, answer: 'Resposta' })) },
    location: { showMap: false, mapQuery: 'São Paulo', showHours: false },
    contact: { channels: ['phone'], closing: 'Entre em contato' },
  }
  return { type, title: `Seção ${type}`, data: data[type] }
}

describe('contentSchema', () => {
  it('aceita conteúdo mínimo válido e aplica padrões', () => {
    const parsed = contentSchema.parse(validContent())
    expect(parsed.sections[0]).toMatchObject({ id: 'hero', enabled: true, placeholder: false })
  })

  it('exige hero', () => {
    const content = validContent()
    content.sections = [] as typeof content.sections
    expect(contentSchema.safeParse(content).success).toBe(false)
  })

  it('exige hero como primeira seção', () => {
    const content = validContent()
    content.sections.unshift(section('stats') as never)
    expect(contentSchema.safeParse(content).success).toBe(false)
  })

  it('não permite hero desabilitado', () => {
    const content = validContent()
    Object.assign(content.sections[0], { enabled: false })
    expect(contentSchema.safeParse(content).success).toBe(false)
  })

  it('exige ids únicos', () => {
    const content = validContent()
    content.sections.push({ ...section('stats'), id: 'hero' } as never)
    expect(contentSchema.safeParse(content).success).toBe(false)
  })

  it('rejeita âncora para seção desabilitada', () => {
    const content = validContent()
    content.sections.push({ ...section('stats'), enabled: false } as never)
    content.nav.cta.to = '#stats'
    expect(contentSchema.safeParse(content).success).toBe(false)
  })

  it('rejeita âncora inexistente', () => {
    const content = validContent()
    content.nav.cta.to = '#nada'
    expect(contentSchema.safeParse(content).success).toBe(false)
  })

  it('limita title a 80 caracteres', () => {
    const content = validContent()
    content.sections[0].title = 'a'.repeat(81)
    expect(contentSchema.safeParse(content).success).toBe(false)
  })

  it('rejeita alt vazio em imagem', () => {
    const content = validContent()
    content.brand.logo.alt = ' '
    expect(contentSchema.safeParse(content).success).toBe(false)
  })

  it('exige width e height em imagem', () => {
    const content = validContent()
    const logo = content.brand.logo as Partial<typeof image>
    delete logo.width
    delete logo.height
    expect(contentSchema.safeParse(content).success).toBe(false)
  })

  it('exige poster do modelo', () => {
    const content = validContent()
    delete (content.sections[0].data.model as Partial<typeof model>).poster
    expect(contentSchema.safeParse(content).success).toBe(false)
  })

  it('exige arquivo .glb para modelo glb', () => {
    const content = validContent()
    content.sections.push({ ...section('showcase3d'), data: { model: { ...model, kind: 'glb', glb: { src: '/client/model.obj' } }, caption: 'Modelo', controls: true } } as never)
    expect(contentSchema.safeParse(content).success).toBe(false)
  })

  it('exige texture para modelo medal', () => {
    const content = validContent()
    delete (content.sections[0].data.model.medal as Partial<typeof model.medal>).texture
    expect(contentSchema.safeParse(content).success).toBe(false)
  })

  it('exige placeholder para depoimento sem consentimento', () => {
    const content = validContent()
    content.sections.push({ ...section('testimonials'), data: { ...(section('testimonials').data as Record<string, unknown>), consentConfirmed: false } } as never)
    expect(contentSchema.safeParse(content).success).toBe(false)
  })

  it('exige horas para o status do hero', () => {
    const content = validContent()
    content.sections[0].data.status = true
    expect(contentSchema.safeParse(content).success).toBe(false)
  })

  it('exige endereço para a seção de localização', () => {
    const content = validContent()
    content.sections.push(section('location') as never)
    expect(contentSchema.safeParse(content).success).toBe(false)
  })

  it('exige dados correspondentes aos canais de contato', () => {
    const content = validContent()
    content.sections.push(section('contact') as never)
    Object.assign(content, { business: { schemaType: 'LocalBusiness', timezone: 'America/Sao_Paulo' } })
    expect(contentSchema.safeParse(content).success).toBe(false)
  })

  it.each([
    ['faq', 3, 8], ['gallery', 3, 8], ['features', 3, 6],
    ['stats', 2, 4], ['offers', 2, 6], ['testimonials', 2, 4],
  ])('limita %s.items entre %i e %i', (type, min, max) => {
    const content = validContent()
    const sample = (section(type).data as { items: unknown[] }).items[0]
    content.sections.push(section(type, Array.from({ length: min - 1 }, () => sample)) as never)
    expect(contentSchema.safeParse(content).success).toBe(false)
    content.sections.pop()
    content.sections.push(section(type, Array.from({ length: max + 1 }, () => sample)) as never)
    expect(contentSchema.safeParse(content).success).toBe(false)
  })
})
