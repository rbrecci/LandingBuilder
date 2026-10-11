import { act, render, screen, waitFor } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { afterEach, expect, it, vi } from 'vitest'
import { useCapabilities } from '../../src/motion/prefs'

function Probe() {
  const capabilities = useCapabilities()
  return <output>{JSON.stringify(capabilities)}</output>
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

it('renderiza no servidor sem acessar window', () => {
  vi.stubGlobal('window', undefined)

  expect(renderToString(<Probe />)).toContain(
    '&quot;reducedMotion&quot;:false,&quot;coarsePointer&quot;:false,&quot;saveData&quot;:false,&quot;webgl&quot;:false,&quot;ready&quot;:false',
  )
})

it('atualiza a preferencia de movimento quando a media query muda', async () => {
  let reduced = false
  const listeners = new Set<(event: MediaQueryListEvent) => void>()
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
    get matches() { return query.includes('reduced-motion') ? reduced : false },
    addEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => listeners.add(listener),
    removeEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener),
  })))
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)

  const { unmount } = render(<Probe />)
  await waitFor(() => expect(JSON.parse(screen.getByRole('status').textContent ?? '{}').ready).toBe(true))

  reduced = true
  act(() => {
    for (const listener of listeners) listener({ matches: true } as MediaQueryListEvent)
  })

  expect(JSON.parse(screen.getByRole('status').textContent ?? '{}').reducedMotion).toBe(true)
  unmount()
  expect(listeners.size).toBe(0)
})
