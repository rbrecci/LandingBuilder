import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ContactSection, Content, LocationSection } from '../../src/content/schema.ts'
import { Contact } from '../../src/sections/contact/Contact.tsx'
import { Location } from '../../src/sections/location/Location.tsx'

const business: NonNullable<Content['business']> = {
  schemaType: 'Store',
  address: {
    street: 'Rua Exemplo, 100',
    district: 'Centro',
    city: 'São Paulo',
    region: 'SP',
    postalCode: '01000-000',
    country: 'BR',
  },
  phone: '+5511900000000',
  whatsapp: '5511900000000',
  email: 'contato@exemplo.com.br',
  social: [
    { network: 'instagram', url: 'https://www.instagram.com/exemplo/' },
    { network: 'facebook', url: 'https://www.facebook.com/exemplo/' },
  ],
  timezone: 'America/Sao_Paulo',
  hours: [
    { day: 0, opens: '07:30', closes: '14:00' },
    { day: 1, opens: '07:00', closes: '20:00' },
    { day: 6, opens: '07:00', closes: '20:00' },
  ],
  hoursConfirmed: false,
}

const location: LocationSection = {
  id: 'onde',
  type: 'location',
  enabled: true,
  tone: 'light',
  title: 'Onde estamos',
  placeholder: false,
  data: { showMap: true, mapQuery: 'Rua Exemplo, 100, São Paulo, SP', showHours: true },
}

const contact: ContactSection = {
  id: 'contato',
  type: 'contact',
  enabled: true,
  tone: 'dark',
  title: 'Fale conosco',
  placeholder: false,
  data: { channels: ['phone', 'whatsapp', 'email', 'instagram'], closing: 'Até breve!' },
}

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('Location', () => {
  it('destaca apenas o dia atual, exibe mapa acessível e avisa que o horário precisa de confirmação', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-11T16:00:00Z'))
    const { container } = render(<Location section={location} index={10} total={11} business={business} />)

    const currentRows = container.querySelectorAll('tr[aria-current="date"]')
    expect(currentRows).toHaveLength(1)
    expect(currentRows[0].textContent).toMatch(/domingo/i)
    const map = screen.getByTitle(/mapa/i)
    expect(map.tagName).toBe('IFRAME')
    expect(map.getAttribute('loading')).toBe('lazy')
    expect(map.getAttribute('referrerpolicy')).toBeTruthy()
    expect(screen.getByText(/horário a confirmar/i)).toBeTruthy()

    const route = container.querySelector<HTMLAnchorElement>('a[href^="https://www.google.com/maps/dir/"]')
    expect(route).not.toBeNull()
    const url = new URL(route!.href)
    expect(url.searchParams.get('api')).toBe('1')
    expect(url.searchParams.get('destination')).toContain('Rua Exemplo, 100')
  })

  it('remove o aviso com horário confirmado e omite o iframe quando o mapa está desligado', () => {
    render(<Location
      section={{ ...location, data: { ...location.data, showMap: false } }}
      index={10}
      total={11}
      business={{ ...business, hoursConfirmed: true }}
    />)

    expect(screen.queryByText(/horário a confirmar/i)).toBeNull()
    expect(screen.queryByTitle(/mapa/i)).toBeNull()
  })
})

describe('Contact', () => {
  it('cria os links dos canais configurados', () => {
    const { container } = render(<Contact section={contact} index={11} total={11} business={business} />)
    const hrefs = Array.from(container.querySelectorAll('a'), (anchor) => anchor.getAttribute('href'))

    expect(hrefs).toContain('tel:+5511900000000')
    expect(hrefs).toContain('https://wa.me/5511900000000')
    expect(hrefs).toContain('mailto:contato@exemplo.com.br')
    expect(hrefs).toContain('https://www.instagram.com/exemplo/')
    expect(hrefs).not.toContain('https://www.facebook.com/exemplo/')
  })

  it('não mostra canais presentes no negócio que não foram pedidos pela seção', () => {
    const { container } = render(<Contact
      section={{ ...contact, data: { ...contact.data, channels: ['email'] } }}
      index={11}
      total={11}
      business={business}
    />)
    const hrefs = Array.from(container.querySelectorAll('a'), (anchor) => anchor.getAttribute('href'))

    expect(hrefs).toContain('mailto:contato@exemplo.com.br')
    expect(hrefs.some((href) => href?.startsWith('tel:') || href?.startsWith('https://wa.me/'))).toBe(false)
    expect(hrefs).not.toContain('https://www.instagram.com/exemplo/')
  })
})
