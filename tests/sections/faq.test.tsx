import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import type { FaqSection } from '../../src/content/schema.ts'
import { Faq } from '../../src/sections/faq/Faq.tsx'

const section: FaqSection = {
  type: 'faq',
  id: 'duvidas',
  enabled: true,
  tone: 'light',
  title: 'Dúvidas frequentes',
  placeholder: false,
  data: {
    items: [
      { question: 'Como funciona?', answer: 'Veja as informações na página.' },
      { question: 'Onde fica?', answer: 'O endereço está no rodapé.' },
      { question: 'Como entrar em contato?', answer: 'Use o telefone informado.' },
    ],
  },
}

afterEach(cleanup)

describe('Faq', () => {
  it('renderiza um details e um summary por pergunta', () => {
    const { container } = render(<Faq section={section} index={1} total={3} />)

    expect(container.querySelectorAll('details')).toHaveLength(section.data.items.length)
    expect(container.querySelectorAll('summary')).toHaveLength(section.data.items.length)
    expect(screen.getByText('Como funciona?').closest('summary')).not.toBeNull()
  })
})
