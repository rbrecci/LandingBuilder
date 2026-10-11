import type { SceneObject } from './Scene'

export function GlbModel({ object, scale, rotation }: {
  object: SceneObject
  scale: number
  rotation: [number, number, number]
}) {
  return <primitive object={object} scale={scale} rotation={rotation} />
}
