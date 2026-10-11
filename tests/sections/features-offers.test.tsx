import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import type { FeaturesSection, OffersSection } from '../../src/content/schema'
import { Features } from '../../src/sections/features/Features'
import { Offers } from '../../src/sections/offers/Offers'

afterEach(cleanup)

const featuresSection: FeaturesSection = {
  type: 'features',
  id: 'servicos',
  enabled: true,
  tone: 'light',
  title: 'Nossos serviços',
  placeholder: false,
  data: {
    items: [
      {
        title: 'Café',
        text: 'Café preparado na hora.',
        image: { src: '/client/cafe.webp', alt: 'Xícara de café sobre a mesa', width: 800, height: 600 },
      },
      { title: 'Pães', text: 'Pães feitos todos os dias.' },
      { title: 'Encontros', text: 'Um espaço para conversar.' },
    ],
  },
}

const offersSection: OffersSection = {
  type: 'offers',
  id: 'ofertas',
  enabled: true,
  tone: 'accent',
  title: 'Ofertas da semana',
  placeholder: false,
  data: {
    items: [
      { name: 'Pão francês', price: '14.9', unit: 'por kg', tag: 'Destaque', validUntil: 'Até domingo' },
      { name: 'Café da casa', price: 'R$ 12', unit: 'unidade' },
    ],
    note: 'Preços ilustrativos para esta demonstração.',
  },
}

describe('Features', () => {
  it('mostra todos os serviços e preserva os dados da imagem', () => {
    render(<Features section={featuresSection} index={4} total={11} />)

    const region = screen.getByRole('region', { name: 'Nossos serviços' })
    const cards = within(region).getAllByRole('listitem')
    expect(cards).toHaveLength(3)
    expect(within(cards[0]).getByText('Café preparado na hora.')).toBeTruthy()
    expect(within(cards[1]).getByText('Pães feitos todos os dias.')).toBeTruthy()

    const image = within(region).getByRole('img', { name: 'Xícara de café sobre a mesa' })
    expect(image.getAttribute('width')).toBe('800')
    expect(image.getAttribute('height')).toBe('600')
    expect(image.getAttribute('loading')).toBe('lazy')
    expect(within(region).getAllByRole('img')).toHaveLength(1)
    expect(region.querySelectorAll('[data-reveal]')).toHaveLength(3)
  })

  it('mostra o selo quando os dados são de exemplo', () => {
    render(<Features section={{ ...featuresSection, placeholder: true }} index={4} total={11} />)
    expect(screen.getByText('Exemplo')).toBeTruthy()
  })
})

describe('Offers', () => {
  it('mostra preço em reais, unidade, validade, tag e nota', () => {
    render(<Offers section={offersSection} index={7} total={11} />)

    const region = screen.getByRole('region', { name: 'Ofertas da semana' })
    const cards = within(region).getAllByRole('listitem')
    expect(cards).toHaveLength(2)
    expect(within(cards[0]).getByText('Pão francês')).toBeTruthy()
    expect(within(cards[0]).getByText('R$ 14,90')).toBeTruthy()
    expect(within(cards[0]).getByText('por kg')).toBeTruthy()
    expect(within(cards[0]).getByText('Até domingo')).toBeTruthy()
    expect(within(cards[0]).getByText('Destaque')).toBeTruthy()
    expect(within(cards[1]).getByText('R$ 12')).toBeTruthy()
    expect(within(region).getByText('Preços ilustrativos para esta demonstração.')).toBeTruthy()
    expect(region.querySelectorAll('[data-reveal]')).toHaveLength(2)
  })
})
