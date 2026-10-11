import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import type { Content } from '../../src/content/schema.ts'
import { Footer } from '../../src/components/layout/Footer.tsx'

const brand: Content['brand'] = {
  name: 'Marca Exemplo',
  shortName: 'Exemplo',
  tagline: 'Uma frase da marca',
  logo: { src: '/client/logo.svg', alt: 'Marca Exemplo', width: 64, height: 64 },
}

const business: NonNullable<Content['business']> = {
  schemaType: 'LocalBusiness',
  timezone: 'America/Sao_Paulo',
  hoursConfirmed: false,
  social: [],
  address: {
    street: 'Rua Exemplo, 10',
    district: 'Centro',
    city: 'São Paulo',
    region: 'SP',
    postalCode: '01000-000',
    country: 'Brasil',
  },
  phone: '+5511999999999',
}

const footer: Content['footer'] = {
  legal: 'Informações legais da marca.',
  links: [{ label: 'Contato', to: '#contato' }],
}

afterEach(cleanup)

describe('Footer', () => {
  it('mostra a marca, o contato, os links e o crédito fixo', () => {
    render(<Footer brand={brand} business={business} footer={footer} />)

    expect(screen.getByText(brand.name)).toBeTruthy()
    expect(screen.getByText(/Rua Exemplo, 10/)).toBeTruthy()
    expect(screen.getByRole('link', { name: business.phone })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Contato' }).getAttribute('href')).toBe('#contato')
    expect(screen.getByText(footer.legal ?? '')).toBeTruthy()

    const creditLinks = screen.getAllByRole('link', { name: 'RBrecci' })
    expect(creditLinks).toHaveLength(1)
    const credit = creditLinks[0]
    expect(credit.getAttribute('href')).toBe('https://github.com/rbrecci')
    expect(credit.getAttribute('target')).toBe('_blank')
    expect(credit.getAttribute('rel')?.split(' ')).toEqual(expect.arrayContaining(['noopener', 'noreferrer']))
    expect(credit.parentElement?.tagName).toBe('P')
    expect(credit.parentElement?.textContent).toBe('Desenvolvido por RBrecci')
  })

  it('mantém o crédito quando footer é undefined', () => {
    render(<Footer brand={brand} business={undefined} footer={undefined} />)

    expect(screen.getAllByRole('link', { name: 'RBrecci' })).toHaveLength(1)
    expect(screen.getByText('Desenvolvido por', { exact: false }).textContent).toBe('Desenvolvido por RBrecci')
  })

  it('inclui o link de crédito no HTML renderizado no servidor', () => {
    const html = renderToString(<Footer brand={brand} business={business} footer={footer} />)

    expect(html).toContain('href="https://github.com/rbrecci"')
    expect(html).toContain('Desenvolvido por ')
    expect(html).toContain('>RBrecci</a>')
  })
})
