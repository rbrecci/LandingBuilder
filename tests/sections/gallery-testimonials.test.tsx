import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { GallerySection, TestimonialsSection } from '../../src/content/schema.ts'
import { Gallery } from '../../src/sections/gallery/Gallery.tsx'
import { Testimonials } from '../../src/sections/testimonials/Testimonials.tsx'

const gallerySection: GallerySection = {
  type: 'gallery',
  id: 'galeria',
  enabled: true,
  tone: 'light',
  title: 'Galeria',
  placeholder: false,
  data: {
    items: Array.from({ length: 4 }, (_, index) => ({
      src: `/client/gallery-${index + 1}.webp`,
      alt: `Foto ${index + 1}`,
      caption: `Legenda ${index + 1}`,
      width: 800,
      height: 600,
    })),
  },
}

const testimonialsSection: TestimonialsSection = {
  type: 'testimonials',
  id: 'depoimentos',
  enabled: true,
  tone: 'light',
  title: 'Depoimentos',
  placeholder: false,
  data: {
    consentConfirmed: false,
    items: [
      { quote: 'Atendimento excelente.', author: 'Ana', role: 'Cliente' },
      { quote: 'Gostei muito.', author: 'João' },
    ],
  },
}

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('Gallery', () => {
  it('navega por controles e teclado sem ultrapassar as extremidades', () => {
    render(<Gallery section={gallerySection} index={6} total={11} />)
    const track = screen.getByRole('region', { name: 'Galeria de imagens' })
    const previous = screen.getByRole('button', { name: 'Imagem anterior' }) as HTMLButtonElement
    const next = screen.getByRole('button', { name: 'Próxima imagem' }) as HTMLButtonElement
    const counter = next.parentElement!.querySelector('.gallery-counter')!

    expect(track.getAttribute('tabindex')).toBe('0')
    expect(previous.disabled).toBe(true)
    expect(counter.textContent).toBe('01 / 04')
    fireEvent.click(next)
    expect(counter.textContent).toBe('02 / 04')
    fireEvent.keyDown(track, { key: 'ArrowRight' })
    fireEvent.click(next)
    expect(counter.textContent).toBe('04 / 04')
    expect(next.disabled).toBe(true)
    fireEvent.keyDown(track, { key: 'ArrowRight' })
    expect(counter.textContent).toBe('04 / 04')
    fireEvent.click(previous)
    expect(counter.textContent).toBe('03 / 04')
    fireEvent.keyDown(track, { key: 'ArrowLeft' })
    expect(counter.textContent).toBe('02 / 04')
  })

  it('captura o ponteiro do mouse ao começar o arraste', () => {
    render(<Gallery section={gallerySection} index={6} total={11} />)
    const track = screen.getByRole('region', { name: 'Galeria de imagens' })
    const capture = vi.fn()
    track.setPointerCapture = capture

    fireEvent.pointerDown(track, { pointerType: 'mouse', button: 0, clientX: 180, pointerId: 7 })

    expect(capture).toHaveBeenCalledWith(7)
  })

  it('avança ao arrastar e descarta o gesto quando a captura é perdida', () => {
    render(<Gallery section={gallerySection} index={6} total={11} />)
    const track = screen.getByRole('region', { name: 'Galeria de imagens' })
    const counter = screen.getByText('01 / 04')
    track.setPointerCapture = vi.fn()

    fireEvent.pointerDown(track, { pointerType: 'mouse', button: 0, clientX: 180, pointerId: 7 })
    fireEvent.pointerUp(track, { pointerType: 'mouse', button: 0, clientX: 40, pointerId: 7 })
    expect(counter.textContent).toBe('02 / 04')

    fireEvent.pointerDown(track, { pointerType: 'mouse', button: 0, clientX: 180, pointerId: 7 })
    fireEvent.lostPointerCapture(track, { pointerId: 7 })
    fireEvent.pointerUp(track, { pointerType: 'mouse', button: 0, clientX: 40, pointerId: 7 })
    expect(counter.textContent).toBe('02 / 04')
  })

  it('mantém texto alternativo e dimensões nas imagens', () => {
    render(<Gallery section={gallerySection} index={6} total={11} />)
    const images = within(screen.getByRole('region', { name: 'Galeria de imagens' })).getAllByRole('img')

    expect(images).toHaveLength(4)
    images.forEach((image, index) => {
      expect(image.getAttribute('alt')).toBe(`Foto ${index + 1}`)
      expect(image.getAttribute('width')).toBe('800')
      expect(image.getAttribute('height')).toBe('600')
    })
  })
})

describe('Testimonials', () => {
  it('mostra o selo Exemplo quando o consentimento não foi confirmado', () => {
    render(<Testimonials section={testimonialsSection} index={8} total={11} />)

    expect(screen.getByText('Exemplo')).toBeTruthy()
    expect(screen.getByText('Atendimento excelente.')).toBeTruthy()
    expect(screen.getByText('João')).toBeTruthy()
  })

  it('omite o selo quando o consentimento foi confirmado', () => {
    render(<Testimonials section={{ ...testimonialsSection, data: { ...testimonialsSection.data, consentConfirmed: true } }} index={8} total={11} />)

    expect(screen.queryByText('Exemplo')).toBeNull()
  })
})
