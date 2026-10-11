import { useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js'
import type { ModelConfig } from '../content/schema.ts'

export function GlbModel({ config }: { config: Extract<ModelConfig, { kind: 'glb' }> }) {
  const gltf = useLoader(GLTFLoader, config.glb.src, (loader) => loader.setMeshoptDecoder(MeshoptDecoder))
  const object = useMemo(() => gltf.scene.clone(true), [gltf.scene])
  return <primitive object={object} scale={config.glb.scale} rotation={config.glb.rotation} />
}
