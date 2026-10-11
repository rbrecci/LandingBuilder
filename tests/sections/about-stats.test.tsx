import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import type { AboutSection, StatsSection } from '../../src/content/schema'
import { About } from '../../src/sections/about/About'
import { Stats } from '../../src/sections/stats/Stats'

afterEach(cleanup)

const aboutSection: AboutSection = {
  type: 'about',
  id: 'sobre',
  enabled: true,
  tone: 'light',
  title: 'Nossa história',
  placeholder: false,
  data: {
    paragraphs: ['Primeiro parágrafo.', 'Segundo parágrafo.', 'Terceiro parágrafo.'],
    image: { src: '/client/about.webp', alt: 'Mesa de café preparada', width: 1200, height: 900 },
    highlight: { value: '15 anos', label: 'no bairro' },
  },
}

const statsSection: StatsSection = {
  type: 'stats',
  id: 'numeros',
  enabled: true,
  tone: 'brand',
  title: 'Em números',
  placeholder: false,
  data: {
    items: [
      { value: '15', label: 'anos de história' },
      { value: '3', label: 'gerações', note: 'da mesma família' },
    ],
  },
}

describe('About', () => {
  it('renderiza a imagem com dimensões e os parágrafos na ordem dos dados', () => {
    render(<About section={aboutSection} index={3} total={8} />)

    const region = screen.getByRole('region', { name: 'Nossa história' })
    const image = within(region).getByRole('img', { name: 'Mesa de café preparada' })
    expect(image.getAttribute('width')).toBe('1200')
    expect(image.getAttribute('height')).toBe('900')
    expect(image.getAttribute('loading')).toBe('lazy')
    expect(image.parentElement?.classList.contains('parallax')).toBe(true)
    expect(Array.from(region.querySelectorAll('.about__paragraphs p'), (paragraph) => paragraph.textContent)).toEqual(
      aboutSection.data.paragraphs,
    )
    expect(within(region).getByText('15 anos')).toBeTruthy()
  })

  it('mostra o selo apenas quando o conteúdo é exemplo', () => {
    render(<About section={{ ...aboutSection, placeholder: true }} index={3} total={8} />)
    expect(screen.getByText('Exemplo')).toBeTruthy()
  })
})

describe('Stats', () => {
  it('renderiza um item de lista para cada número dos dados', () => {
    render(<Stats section={statsSection} index={2} total={8} />)

    const region = screen.getByRole('region', { name: 'Em números' })
    const list = within(region).getByRole('list')
    expect(within(list).getAllByRole('listitem')).toHaveLength(statsSection.data.items.length)
    expect(within(list).getByText('da mesma família')).toBeTruthy()
    expect(list.querySelectorAll('[data-reveal]')).toHaveLength(statsSection.data.items.length)
  })

  it('mostra o selo quando a seção contém dados de exemplo', () => {
    render(<Stats section={{ ...statsSection, placeholder: true }} index={2} total={8} />)
    expect(screen.getByText('Exemplo')).toBeTruthy()
  })
})
