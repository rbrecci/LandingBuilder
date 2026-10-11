import type { SceneTexture } from './Scene'

type MedalColors = {
  edge: string
  rim: string
  back: string
}

export function MedalModel({ texture, thickness, colors }: {
  texture: SceneTexture
  thickness: number
  colors: MedalColors
}) {
  const faceZ = thickness / 2 + 0.003

  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.075, 1.075, thickness, 96]} />
        <meshStandardMaterial color={colors.edge} metalness={0.72} roughness={0.33} />
      </mesh>
      <mesh position={[0, 0, faceZ]}>
        <circleGeometry args={[1.035, 96]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, faceZ + 0.013]}>
        <torusGeometry args={[1.055, 0.018, 12, 96]} />
        <meshStandardMaterial color={colors.rim} metalness={0.82} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0, -faceZ]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[0.92, 72]} />
        <meshStandardMaterial color={colors.back} metalness={0.48} roughness={0.43} />
      </mesh>
    </group>
  )
}
