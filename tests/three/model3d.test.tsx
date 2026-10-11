// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ModelConfig } from '../../src/content/schema.ts'

const sceneState = vi.hoisted(() => ({ imports: 0, throws: false }))
const capabilitiesState = vi.hoisted(() => ({
  current: {
    reducedMotion: false,
    coarsePointer: false,
    saveData: false,
    webgl: true,
    ready: true,
  },
}))

vi.mock('@react-three/fiber', async () => {
  const actual = await vi.importActual<typeof import('@react-three/fiber')>('@react-three/fiber')
  const React = await import('react')
  return {
    ...actual,
    Canvas: function MockCanvas({ onCreated }: {
      onCreated: (state: { gl: { domElement: HTMLCanvasElement }; invalidate: () => void }) => void
    }) {
      const canvas = React.useRef<HTMLCanvasElement>(null)
      React.useEffect(() => {
        if (canvas.current) onCreated({ gl: { domElement: canvas.current }, invalidate: () => undefined })
      }, [onCreated])
      return <canvas ref={canvas} data-testid="scene-canvas" />
    },
  }
})

vi.mock('../../src/motion/prefs.ts', () => ({
  useCapabilities: () => capabilitiesState.current,
}))

vi.mock('../../src/three/Scene.tsx', async () => {
  const React = await import('react')
  sceneState.imports += 1
  return {
    Scene: function MockScene({ onContextLost, onContextRestored }: {
      onContextLost: () => void
      onContextRestored: () => void
    }) {
      if (sceneState.throws) throw new Error('Falha na cena')
      const canvas = React.useRef<HTMLCanvasElement>(null)
      React.useEffect(() => {
        const element = canvas.current!
        element.addEventListener('webglcontextlost', onContextLost)
        element.addEventListener('webglcontextrestored', onContextRestored)
        return () => {
          element.removeEventListener('webglcontextlost', onContextLost)
          element.removeEventListener('webglcontextrestored', onContextRestored)
        }
      }, [onContextLost, onContextRestored])
      return <canvas ref={canvas} aria-hidden="true" data-testid="model-canvas" />
    },
  }
})

import { Model3D } from '../../src/three/Model3D.tsx'

const config: ModelConfig = {
  kind: 'medal',
  alt: 'Medalhão de teste',
  poster: { src: '/client/poster.webp', alt: 'Pôster', width: 500, height: 500 },
  interaction: 'both',
  mobile: 'scroll',
  maxTiltDeg: 18,
  medal: { texture: '/client/logo.webp', thickness: 0.16 },
}

let observer: { emit: (visible: boolean) => void } | undefined

class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null
  readonly rootMargin: string
  readonly thresholds = []
  private callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback
    this.rootMargin = options?.rootMargin ?? ''
    observer = { emit: (visible) => this.emit(visible) }
  }

  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return [] }
  emit(visible: boolean) {
    this.callback([{ isIntersecting: visible } as IntersectionObserverEntry], this)
  }
}

beforeEach(() => {
  capabilitiesState.current = {
    reducedMotion: false,
    coarsePointer: false,
    saveData: false,
    webgl: true,
    ready: true,
  }
  sceneState.throws = false
  observer = undefined
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
  vi.stubGlobal('requestIdleCallback', (callback: IdleRequestCallback) => {
    callback({ didTimeout: false, timeRemaining: () => 50 })
    return 1
  })
  vi.stubGlobal('cancelIdleCallback', () => undefined)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

async function enterViewport() {
  act(() => observer?.emit(true))
  await waitFor(() => expect(screen.getByTestId('model-canvas')).toBeTruthy())
}

describe('Model3D', () => {
  it('renderiza o pôster no HTML inicial sem canvas', () => {
    const html = renderToString(<Model3D config={config} alt={config.alt} mode="tilt" />)
    expect(html).toContain('/client/poster.webp')
    expect(html).not.toContain('<canvas')
  })

  it('prioriza somente o pôster solicitado no HTML inicial', () => {
    const hero = new DOMParser().parseFromString(
      renderToString(<Model3D config={config} alt={config.alt} mode="tilt" posterFetchPriority="high" />),
      'text/html',
    ).querySelector('.model-3d__poster')
    const showcase = new DOMParser().parseFromString(
      renderToString(<Model3D config={config} alt={config.alt} mode="orbit" />),
      'text/html',
    ).querySelector('.model-3d__poster')

    expect(hero?.getAttribute('fetchpriority')).toBe('high')
    expect(hero?.getAttribute('width')).toBe('500')
    expect(hero?.getAttribute('height')).toBe('500')
    expect(showcase?.hasAttribute('fetchpriority')).toBe(false)
  })

  it('não importa a cena quando o movimento está reduzido', () => {
    const previous = sceneState.imports
    capabilitiesState.current.reducedMotion = true
    render(<Model3D config={config} alt={config.alt} mode="tilt" />)
    act(() => observer?.emit(true))
    expect(sceneState.imports).toBe(previous)
    expect(screen.queryByTestId('model-canvas')).toBeNull()
  })

  it('mantém o pôster quando WebGL não está disponível', () => {
    capabilitiesState.current.webgl = false
    render(<Model3D config={config} alt={config.alt} mode="tilt" />)
    act(() => observer?.emit(true))
    expect(screen.getByRole('img', { name: config.alt })).toBeTruthy()
    expect(screen.queryByTestId('model-canvas')).toBeNull()
  })

  it('preserva o pôster e o contêiner após erro da cena', async () => {
    sceneState.throws = true
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    render(<Model3D config={config} alt={config.alt} mode="orbit" />)
    act(() => observer?.emit(true))
    await waitFor(() => expect(screen.getByRole('img', { name: config.alt })).toBeTruthy())
    expect(screen.getByRole('img', { name: config.alt }).querySelector('img')).toBeTruthy()
    expect(screen.queryByTestId('model-canvas')).toBeNull()
  })

  it('mostra o pôster após perda de contexto e restaura a cena', async () => {
    render(<Model3D config={config} alt={config.alt} mode="orbit" />)
    await enterViewport()
    const canvas = screen.getByTestId('model-canvas')
    fireEvent(canvas, new Event('webglcontextlost', { cancelable: true }))
    expect(screen.getByRole('img', { name: config.alt }).className).toContain('is-fallback')
    fireEvent(canvas, new Event('webglcontextrestored'))
    expect(screen.getByRole('img', { name: config.alt }).className).not.toContain('is-fallback')
  })

  it('usa o pôster em aparelho com ponteiro grosseiro quando mobile é still', () => {
    capabilitiesState.current.coarsePointer = true
    render(<Model3D config={{ ...config, mobile: 'still' }} alt={config.alt} mode="tilt" />)
    act(() => observer?.emit(true))
    expect(screen.queryByTestId('model-canvas')).toBeNull()
  })

  it('atualiza o modo quando a preferência de movimento muda', async () => {
    const view = render(<Model3D config={config} alt={config.alt} mode="tilt" />)
    await enterViewport()
    capabilitiesState.current.reducedMotion = true
    view.rerender(<Model3D config={config} alt={config.alt} mode="tilt" />)
    expect(screen.queryByTestId('model-canvas')).toBeNull()
    capabilitiesState.current.reducedMotion = false
    view.rerender(<Model3D config={config} alt={config.alt} mode="tilt" />)
    await waitFor(() => expect(screen.getByTestId('model-canvas')).toBeTruthy())
  })

  it('remove os listeners do canvas quando a cena desmonta', async () => {
    const { Scene } = await vi.importActual<typeof import('../../src/three/Scene.tsx')>(
      '../../src/three/Scene.tsx',
    )
    const onContextLost = vi.fn()
    const onContextRestored = vi.fn()
    const view = render(
      <Scene config={config} mode="tilt" autoRotate={false} coarsePointer={false}
        motion={{ current: { pointerX: 0, pointerY: 0, scroll: 0, rotationDegrees: 0, hover: false } }}
        onReady={vi.fn()} onContextLost={onContextLost} onContextRestored={onContextRestored} />,
    )
    const canvas = screen.getByTestId('scene-canvas')
    view.unmount()
    fireEvent(canvas, new Event('webglcontextlost', { cancelable: true }))
    fireEvent(canvas, new Event('webglcontextrestored'))
    expect(onContextLost).not.toHaveBeenCalled()
    expect(onContextRestored).not.toHaveBeenCalled()
  }, 20000)
})
