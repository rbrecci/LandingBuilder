// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Content, HeroSection, Showcase3dSection } from '../../src/content/schema.ts'

const rotateBy = vi.hoisted(() => vi.fn())
const interactive = vi.hoisted(() => ({ value: true }))

vi.mock('../../src/motion/prefs.ts', () => ({
  useCapabilities: () => ({ reducedMotion: false }),
}))

vi.mock('../../src/three/Model3D.tsx', async () => {
  const React = await import('react')
  return {
    Model3D: function MockModel3D({ mode, autoRotate, ref, onInteractiveChange }: {
      mode: 'tilt' | 'orbit'
      autoRotate?: boolean
      ref?: React.Ref<{ rotateBy: (degrees: number) => void }>
      onInteractiveChange?: (active: boolean) => void
    }) {
      React.useImperativeHandle(ref, () => ({ rotateBy }))
      React.useEffect(() => { onInteractiveChange?.(interactive.value) })
      return <div data-testid="model-3d" data-mode={mode} data-auto-rotate={String(autoRotate)} />
    },
  }
})

import { Hero } from '../../src/sections/hero/Hero.tsx'
import { Showcase3d } from '../../src/sections/showcase3d/Showcase3d.tsx'

afterEach(() => {
  cleanup()
  rotateBy.mockClear()
  interactive.value = true
})

const model: HeroSection['data']['model'] = {
  kind: 'medal',
  alt: 'Medalhão ilustrativo',
  poster: { src: '/client/poster.webp', alt: 'Medalhão', width: 1200, height: 800 },
  interaction: 'both',
  mobile: 'scroll',
  maxTiltDeg: 18,
  medal: { texture: '/client/logo.webp', thickness: 0.16 },
}

const hero: HeroSection = {
  type: 'hero', id: 'inicio', enabled: true, tone: 'dark', title: 'Título da seção', placeholder: false,
  data: {
    headline: 'Uma história para descobrir',
    subheadline: 'Uma frase de apoio.',
    ctas: [{ label: 'Fale conosco', to: '#contato', variant: 'primary' }],
    model,
    layers: [
      { src: '/client/layer-1.svg', speed: 0.1 },
      { src: '/client/layer-2.svg', speed: -0.2 },
      { src: '/client/layer-3.svg', speed: 0.3 },
    ],
    status: false,
  },
}

const sections: Content['sections'] = [
  hero,
  { type: 'contact', id: 'contato', enabled: true, tone: 'light', title: 'Contato', placeholder: false, data: { channels: [], closing: 'Até logo' } },
]

const business: Content['business'] = {
  schemaType: 'Restaurant', timezone: 'America/Sao_Paulo', social: [], hoursConfirmed: true,
  hours: [{ day: 1, opens: '08:00', closes: '18:00' }],
}

const showcase: Showcase3dSection = {
  type: 'showcase3d', id: 'produto-3d', enabled: true, tone: 'light', title: 'Nosso produto', placeholder: false,
  data: { model, caption: 'Medalhão ilustrativo da marca', controls: true },
}

describe('Hero', () => {
  it('renderiza um h1, CTA resolvido, três camadas decorativas e modelo tilt', () => {
    render(<Hero section={hero} sections={sections} business={business} index={1} total={11} />)

    const region = screen.getByRole('region', { name: hero.data.headline })
    expect(within(region).getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(within(region).getByRole('link', { name: 'Fale conosco' }).getAttribute('href')).toBe('#contato')
    const layers = region.querySelectorAll('img[aria-hidden="true"][alt=""]')
    expect(layers).toHaveLength(3)
    expect(Array.from(layers, (layer) => layer.parentElement?.classList.contains('parallax'))).toEqual([true, true, true])
    expect(within(region).getByTestId('model-3d').getAttribute('data-mode')).toBe('tilt')
    expect(within(region).getByText('01 / 11')).toBeTruthy()
  })

  it('não mostra o chip sem status e calcula o status só depois de montar', () => {
    const withStatus = { ...hero, data: { ...hero.data, status: true } }
    expect(renderToString(<Hero section={withStatus} sections={sections} business={business} index={1} total={11} />)).not.toContain('role="status"')

    const { rerender } = render(<Hero section={hero} sections={sections} business={business} index={1} total={11} />)
    expect(screen.queryByRole('status')).toBeNull()

    rerender(<Hero section={withStatus} sections={sections} business={business} index={1} total={11} />)
    expect(screen.getByRole('status').textContent).toMatch(/Aberto|Fechado/)

    rerender(<Hero section={withStatus} sections={sections} index={1} total={11} />)
    expect(screen.queryByRole('status')).toBeNull()
  })
})

describe('Showcase3d', () => {
  it('omite controles enquanto o modelo mostra o poster de fallback', () => {
    interactive.value = false
    const { rerender } = render(<Showcase3d section={showcase} index={5} total={11} />)

    expect(screen.queryByRole('group', { name: 'Controles do modelo 3D' })).toBeNull()
    expect(renderToString(<Showcase3d section={showcase} index={5} total={11} />)).not.toContain('Controles do modelo 3D')

    interactive.value = true
    rerender(<Showcase3d section={showcase} index={5} total={11} />)
    expect(screen.getByRole('group', { name: 'Controles do modelo 3D' })).toBeTruthy()

    interactive.value = false
    rerender(<Showcase3d section={showcase} index={5} total={11} />)
    expect(screen.queryByRole('group', { name: 'Controles do modelo 3D' })).toBeNull()
  })

  it('gira em passos de 15 graus, pausa e retoma a rotação', () => {
    render(<Showcase3d section={showcase} index={5} total={11} />)

    const region = screen.getByRole('region', { name: 'Nosso produto' })
    expect(within(region).getByTestId('model-3d').getAttribute('data-mode')).toBe('orbit')
    expect(within(region).getByText('Medalhão ilustrativo da marca')).toBeTruthy()
    fireEvent.click(within(region).getByRole('button', { name: 'Girar para a esquerda' }))
    fireEvent.click(within(region).getByRole('button', { name: 'Girar para a direita' }))
    expect(rotateBy.mock.calls).toEqual([[-15], [15]])

    const pause = within(region).getByRole('button', { name: 'Pausar rotação' })
    expect(pause.getAttribute('aria-pressed')).toBe('false')
    expect(within(region).getByTestId('model-3d').getAttribute('data-auto-rotate')).toBe('true')
    fireEvent.click(pause)
    const resume = within(region).getByRole('button', { name: 'Retomar rotação' })
    expect(resume.getAttribute('aria-pressed')).toBe('true')
    expect(within(region).getByTestId('model-3d').getAttribute('data-auto-rotate')).toBe('false')
    fireEvent.click(resume)
    expect(within(region).getByRole('button', { name: 'Pausar rotação' }).getAttribute('aria-pressed')).toBe('false')
    fireEvent.keyDown(within(region).getByRole('button', { name: 'Pausar rotação' }), { key: 'ArrowLeft' })
    expect(rotateBy.mock.calls.at(-1)).toEqual([-15])
  })

  it('omite controles quando desativados', () => {
    render(<Showcase3d section={{ ...showcase, data: { ...showcase.data, controls: false } }} index={5} total={11} />)
    expect(screen.queryByRole('button', { name: 'Pausar rotação' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Girar para a esquerda' })).toBeNull()
  })
})
