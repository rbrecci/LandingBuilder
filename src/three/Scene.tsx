import { lazy, Suspense, useEffect, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { MathUtils, SRGBColorSpace, TextureLoader } from 'three'
import type { Group, Texture } from 'three'
import type { ModelConfig } from '../content/schema.ts'
import type { MotionTarget } from './Model3D.tsx'
import { MedalModel } from './MedalModel.tsx'

const OrbitControls = lazy(() => import('@react-three/drei/core/OrbitControls.js')
  .then((module) => ({ default: module.OrbitControls })))
const GlbModel = lazy(() => import('./GlbModel.tsx').then((module) => ({ default: module.GlbModel })))

export type SceneTexture = Texture

type SceneProps = {
  config: ModelConfig
  mode: 'tilt' | 'orbit'
  autoRotate: boolean
  coarsePointer: boolean
  motion: RefObject<MotionTarget>
  onReady: (invalidate: () => void) => void
  onContextLost: () => void
  onContextRestored: () => void
}

function MedalAsset({ config, colors }: {
  config: Extract<ModelConfig, { kind: 'medal' }>
  colors: { edge: string; rim: string; back: string }
}) {
  const source = useLoader(TextureLoader, config.medal.texture)
  const texture = useMemo(() => {
    const copy = source.clone()
    copy.colorSpace = SRGBColorSpace
    copy.needsUpdate = true
    return copy
  }, [source])

  useEffect(() => () => texture.dispose(), [texture])
  return <MedalModel texture={texture} thickness={config.medal.thickness} colors={colors} />
}

function GlbAsset({ config }: { config: Extract<ModelConfig, { kind: 'glb' }> }) {
  return (
    <Suspense fallback={null}>
      <GlbModel config={config} />
    </Suspense>
  )
}

function SceneContent({ config, mode, autoRotate, coarsePointer, motion, colors, light }: Pick<SceneProps,
  'config' | 'mode' | 'autoRotate' | 'coarsePointer' | 'motion'> & {
    colors: { edge: string; rim: string; back: string; ambient: string; key: string; fill: string }
    light: { ambient: number; key: number; fill: number }
  }) {
  const group = useRef<Group>(null)
  const autoRotation = useRef(0)
  const { invalidate } = useThree()

  useFrame((_, delta) => {
    const object = group.current
    if (!object) return
    if (autoRotate && mode === 'tilt') autoRotation.current += delta * 12
    const maxTilt = MathUtils.degToRad(config.maxTiltDeg)
    const pointerX = coarsePointer ? 0 : motion.current.pointerX
    const pointerY = coarsePointer ? 0 : motion.current.pointerY
    const scroll = config.interaction === 'none' ? 0 : motion.current.scroll - 0.5
    const desiredX = mode === 'tilt' ? -0.07 - pointerY * maxTilt * 0.5 + scroll * 0.12 : -0.07
    const desiredY = -0.22 + MathUtils.degToRad(motion.current.rotationDegrees + autoRotation.current) +
      (mode === 'tilt' ? pointerX * maxTilt + scroll * 0.12 : 0)
    const desiredScale = mode === 'tilt' && motion.current.hover ? 1.045 : 1
    const blend = 1 - Math.exp(-Math.min(delta, 0.05) * 7)
    object.rotation.x = MathUtils.lerp(object.rotation.x, desiredX, blend)
    object.rotation.y = MathUtils.lerp(object.rotation.y, desiredY, blend)
    object.scale.setScalar(MathUtils.lerp(object.scale.x, desiredScale, blend))

    if (autoRotate || Math.abs(object.rotation.x - desiredX) > 0.001 ||
      Math.abs(object.rotation.y - desiredY) > 0.001 || Math.abs(object.scale.x - desiredScale) > 0.001) {
      invalidate()
    }
  })

  return (
    <>
      <ambientLight intensity={light.ambient} color={colors.ambient} />
      <directionalLight position={[-2, 3, 4]} intensity={light.key} color={colors.key} />
      <directionalLight position={[3, -2, 1]} intensity={light.fill} color={colors.fill} />
      <group ref={group} rotation={[-0.07, -0.22, 0]}>
        {config.kind === 'medal'
          ? <MedalAsset config={config} colors={colors} />
          : <GlbAsset config={config} />}
      </group>
      {mode === 'orbit' && (
        <Suspense fallback={null}>
          <OrbitControls enableZoom={false} enablePan={false} autoRotate={autoRotate} />
        </Suspense>
      )}
    </>
  )
}

export function Scene({ config, mode, autoRotate, coarsePointer, motion, onReady,
  onContextLost, onContextRestored }: SceneProps) {
  const canvas = useRef<HTMLCanvasElement | null>(null)
  const contextListeners = useRef<{ lost: (event: Event) => void; restored: () => void } | null>(null)
  const colors = useMemo(() => {
    const style = getComputedStyle(document.documentElement)
    const read = (name: string) => style.getPropertyValue(name).trim()
    return {
      edge: read('--color-ink'),
      rim: read('--color-accent'),
      back: read('--color-brand'),
      ambient: read('--color-paper'),
      key: read('--color-paper'),
      fill: read('--color-accent'),
    }
  }, [])
  const light = useMemo(() => {
    const style = getComputedStyle(document.documentElement)
    const read = (name: string) => Number.parseFloat(style.getPropertyValue(name)) || 1
    return { ambient: read('--three-ambient'), key: read('--three-key'), fill: read('--three-fill') }
  }, [])

  useEffect(() => {
    return () => {
      const element = canvas.current
      const listeners = contextListeners.current
      if (!element || !listeners) return
      element.removeEventListener('webglcontextlost', listeners.lost)
      element.removeEventListener('webglcontextrestored', listeners.restored)
    }
  }, [])

  return (
    <Canvas
      aria-hidden="true"
      frameloop="demand"
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 3.8], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      onCreated={(state) => {
        const element = state.gl.domElement
        const previous = contextListeners.current
        if (canvas.current && previous) {
          canvas.current.removeEventListener('webglcontextlost', previous.lost)
          canvas.current.removeEventListener('webglcontextrestored', previous.restored)
        }
        const lost = (event: Event) => {
          event.preventDefault()
          onContextLost()
        }
        const restored = () => {
          onContextRestored()
          state.invalidate()
        }
        element.addEventListener('webglcontextlost', lost)
        element.addEventListener('webglcontextrestored', restored)
        canvas.current = element
        contextListeners.current = { lost, restored }
        onReady(state.invalidate)
      }}
    >
      <SceneContent config={config} mode={mode} autoRotate={autoRotate} coarsePointer={coarsePointer}
        motion={motion} colors={colors} light={light} />
    </Canvas>
  )
}
