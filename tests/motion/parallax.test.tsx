import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { Parallax } from '../../src/motion/Parallax'
import { Reveal } from '../../src/motion/Reveal'
import { startScrollDriver } from '../../src/motion/scrollDriver'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

it('nao observa nem inicia rolagem quando o movimento e reduzido', async () => {
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
    matches: query.includes('reduced-motion'),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })))
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
  const observe = vi.fn()
  vi.stubGlobal('IntersectionObserver', class {
    observe = observe
    unobserve = vi.fn()
    disconnect = vi.fn()
  })
  const scroll = vi.spyOn(window, 'addEventListener')

  render(<><Parallax speed={0.4}>Camada</Parallax><Reveal>Conteudo</Reveal></>)
  await waitFor(() => expect(screen.getByText('Camada').hasAttribute('data-parallax')).toBe(false))

  expect(observe).not.toHaveBeenCalled()
  expect(scroll.mock.calls.filter(([event]) => event === 'scroll')).toHaveLength(0)
  expect(screen.getByText('Conteudo').classList.contains('is-visible')).toBe(true)
})

it('limpa o listener de rolagem e o observador', () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })))
  vi.stubGlobal('CSS', { supports: vi.fn(() => false) })
  const disconnect = vi.fn()
  vi.stubGlobal('IntersectionObserver', class {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = disconnect
  })
  const add = vi.spyOn(window, 'addEventListener')
  const remove = vi.spyOn(window, 'removeEventListener')
  const root = document.createElement('div')
  root.innerHTML = '<div data-parallax></div>'

  const cleanup = startScrollDriver(root)
  expect(add.mock.calls.some(([event, , options]) => event === 'scroll' && (options as AddEventListenerOptions).passive)).toBe(true)
  cleanup()

  expect(remove.mock.calls.some(([event]) => event === 'scroll')).toBe(true)
  expect(disconnect).toHaveBeenCalledOnce()
})

it('escreve o progresso apenas nos elementos visiveis', () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })))
  vi.stubGlobal('CSS', { supports: vi.fn(() => false) })
  let notify: IntersectionObserverCallback = () => {}
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback: IntersectionObserverCallback) { notify = callback }
    observe = vi.fn()
    disconnect = vi.fn()
  })
  let frame: FrameRequestCallback = () => {}
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => { frame = callback; return 1 })
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
  const root = document.createElement('div')
  root.innerHTML = '<div data-parallax></div><div data-parallax></div>'
  const [visible, hidden] = Array.from(root.children) as HTMLElement[]
  vi.spyOn(visible, 'getBoundingClientRect').mockReturnValue({ top: 0, height: 100 } as DOMRect)

  const cleanup = startScrollDriver(root)
  notify([{ target: visible, isIntersecting: true }, { target: hidden, isIntersecting: false }] as unknown as IntersectionObserverEntry[], {} as IntersectionObserver)
  frame(0)

  expect(Number(visible.style.getPropertyValue('--p'))).toBeGreaterThanOrEqual(0)
  expect(Number(visible.style.getPropertyValue('--p'))).toBeLessThanOrEqual(1)
  expect(hidden.style.getPropertyValue('--p')).toBe('')
  cleanup()
})

it('nao inicia o driver com movimento reduzido', () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })))
  vi.stubGlobal('CSS', { supports: vi.fn(() => false) })
  const observer = vi.fn()
  vi.stubGlobal('IntersectionObserver', observer)
  const add = vi.spyOn(window, 'addEventListener')
  const root = document.createElement('div')
  root.innerHTML = '<div data-parallax></div>'

  startScrollDriver(root)()

  expect(observer).not.toHaveBeenCalled()
  expect(add.mock.calls.some(([event]) => event === 'scroll')).toBe(false)
})
