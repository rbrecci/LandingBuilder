import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import sample from '../../client/content.json'
import { App } from '../../src/App.tsx'
import { contentSchema } from '../../src/content/schema.ts'

const baseContent = contentSchema.parse(sample)

describe('App', () => {
  it('respeita a ordem, omite seções desabilitadas e numera as habilitadas', () => {
    const content = structuredClone(baseContent)
    const hero = content.sections.find((section) => section.type === 'hero')!
    const features = content.sections.find((section) => section.type === 'features')!
    const about = content.sections.find((section) => section.type === 'about')!
    const stats = content.sections.find((section) => section.type === 'stats')!

    hero.navLabel = 'Início'
    features.navLabel = 'Recursos'
    about.navLabel = undefined
    stats.navLabel = 'Números'
    stats.enabled = false
    content.sections = [
      hero,
      features,
      about,
      ...content.sections.filter((section) => ![hero.id, features.id, about.id].includes(section.id)),
    ]

    const page = new DOMParser().parseFromString(renderToStaticMarkup(<App content={content} />), 'text/html')
    const main = page.querySelector('main#conteudo')
    const enabledSections = content.sections.filter((section) => section.enabled)

    expect(main).not.toBeNull()
    expect(Array.from(main!.querySelectorAll('section[id]'), (section) => section.id)).toEqual(
      enabledSections.map((section) => section.id),
    )
    const total = String(enabledSections.length).padStart(2, '0')
    expect(main!.textContent).toContain(`01 / ${total}`)
    expect(main!.textContent).toContain(`02 / ${total}`)
    expect(main!.textContent).toContain(`${total} / ${total}`)

    const navLinks = Array.from(page.querySelectorAll('header nav a[href^="#"]'), (link) => link.getAttribute('href'))
    expect(navLinks).toContain(`#${hero.id}`)
    expect(navLinks).toContain(`#${features.id}`)
    expect(navLinks).not.toContain(`#${about.id}`)
    expect(navLinks).not.toContain(`#${stats.id}`)
  })

  it('mostra a faixa de demonstração e o crédito no rodapé', () => {
    const content = structuredClone(baseContent)
    content.site.demoBanner.enabled = true

    const page = new DOMParser().parseFromString(renderToStaticMarkup(<App content={content} />), 'text/html')

    expect(page.body.textContent).toContain(content.site.demoBanner.text)
    expect(page.querySelector('footer a[href="https://github.com/rbrecci"]')).not.toBeNull()
  })
})
