import { Component, lazy, Suspense, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { PointerEvent, ReactNode, Ref } from 'react'
import type { ModelConfig } from '../content/schema.ts'
import { useCapabilities } from '../motion/prefs.ts'
import './model3d.css'

const Scene = lazy(() => import('./Scene.tsx').then((module) => ({ default: module.Scene })))

export type Model3DHandle = { rotateBy: (degrees: number) => void }

export type MotionTarget = {
  pointerX: number
  pointerY: number
  scroll: number
  rotationDegrees: number
  hover: boolean
}

type Model3DProps = {
  config: ModelConfig
  alt: string
  mode: 'tilt' | 'orbit'
  autoRotate?: boolean
  posterFetchPriority?: 'high'
  onInteractiveChange?: (active: boolean) => void
  ref?: Ref<Model3DHandle>
}

class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    this.props.onError()
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

export function Model3D({ config, alt, mode, autoRotate = false, posterFetchPriority, onInteractiveChange, ref }: Model3DProps) {
  const capabilities = useCapabilities()
  const container = useRef<HTMLDivElement>(null)
  const invalidate = useRef<() => void>(() => undefined)
  const motion = useRef<MotionTarget>({ pointerX: 0, pointerY: 0, scroll: 0, rotationDegrees: 0, hover: false })
  const [near, setNear] = useState(false)
  const [activated, setActivated] = useState(false)
  const [contextLost, setContextLost] = useState(false)
  const [renderFailed, setRenderFailed] = useState(false)
  const [sceneReady, setSceneReady] = useState(false)

  const eligible = capabilities.ready && capabilities.webgl && !capabilities.reducedMotion &&
    !capabilities.saveData && !(capabilities.coarsePointer && config.mobile === 'still') &&
    !(config.interaction === 'none' && config.mobile === 'still')
  const sceneMounted = eligible && activated && !renderFailed
  const fallback = !sceneMounted || contextLost
  const interactive = sceneMounted && sceneReady && !contextLost

  useEffect(() => {
    onInteractiveChange?.(interactive)
  }, [interactive, onInteractiveChange])

  useEffect(() => {
    if (!sceneMounted) return
    return () => setSceneReady(false)
  }, [sceneMounted])

  useImperativeHandle(ref, () => ({
    rotateBy(degrees: number) {
      motion.current.rotationDegrees += degrees
      invalidate.current()
    },
  }), [])

  useEffect(() => {
    const element = container.current
    if (!element || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), {
      rootMargin: '200px 0px',
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!eligible || !near || activated) return
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(() => setActivated(true))
      return () => cancelIdleCallback(id)
    }
    const id = window.setTimeout(() => setActivated(true), 1000)
    return () => window.clearTimeout(id)
  }, [eligible, near, activated])

  useEffect(() => {
    if (near || !activated) return
    const id = window.setTimeout(() => setActivated(false), 1000)
    return () => window.clearTimeout(id)
  }, [near, activated])

  useEffect(() => {
    if (!sceneMounted || config.interaction === 'none') return
    if (!capabilities.coarsePointer && config.interaction === 'pointer') return
    const update = () => {
      const rect = container.current?.getBoundingClientRect()
      if (!rect) return
      const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)))
      if (Math.abs(motion.current.scroll - progress) > 0.001) {
        motion.current.scroll = progress
        invalidate.current()
      }
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [sceneMounted, config.interaction, capabilities.coarsePointer])

  const pointerEnabled = sceneMounted && mode === 'tilt' && !capabilities.coarsePointer &&
    (config.interaction === 'both' || config.interaction === 'pointer')

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!pointerEnabled) return
    const rect = event.currentTarget.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    motion.current.pointerX = ((event.clientX - rect.left) / rect.width) * 2 - 1
    motion.current.pointerY = ((event.clientY - rect.top) / rect.height) * 2 - 1
    motion.current.hover = true
    invalidate.current()
  }

  const onPointerLeave = () => {
    if (!pointerEnabled) return
    motion.current.pointerX = 0
    motion.current.pointerY = 0
    motion.current.hover = false
    invalidate.current()
  }

  return (
    <div
      ref={container}
      className={`model-3d${fallback ? ' is-fallback' : ''}`}
      role="img"
      aria-label={alt}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <img
        className="model-3d__poster"
        src={config.poster.src}
        alt=""
        fetchPriority={posterFetchPriority}
        width={config.poster.width}
        height={config.poster.height}
      />
      {sceneMounted && (
        <div className="model-3d__scene" hidden={contextLost}>
          <SceneBoundary onError={() => setRenderFailed(true)}>
            <Suspense fallback={null}>
              <Scene
                config={config}
                mode={mode}
                autoRotate={autoRotate}
                coarsePointer={capabilities.coarsePointer}
                motion={motion}
                onReady={(nextInvalidate) => {
                  invalidate.current = nextInvalidate
                  setSceneReady(true)
                }}
                onContextLost={() => setContextLost(true)}
                onContextRestored={() => setContextLost(false)}
              />
            </Suspense>
          </SceneBoundary>
        </div>
      )}
    </div>
  )
}
