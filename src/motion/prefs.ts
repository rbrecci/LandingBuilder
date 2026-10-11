import { useEffect, useState } from 'react'

export type Capabilities = {
  reducedMotion: boolean
  coarsePointer: boolean
  saveData: boolean
  webgl: boolean
  ready: boolean
}

type NetworkConnection = {
  saveData?: boolean
  addEventListener?: (type: 'change', listener: () => void) => void
  removeEventListener?: (type: 'change', listener: () => void) => void
}

const initialCapabilities: Capabilities = {
  reducedMotion: false,
  coarsePointer: false,
  saveData: false,
  webgl: false,
  ready: false,
}

let cachedWebgl: boolean | undefined

function supportsWebgl(): boolean {
  if (cachedWebgl !== undefined) return cachedWebgl
  try {
    const canvas = document.createElement('canvas')
    cachedWebgl = Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    cachedWebgl = false
  }
  return cachedWebgl
}

export function useCapabilities(): Capabilities {
  const [capabilities, setCapabilities] = useState<Capabilities>(initialCapabilities)

  useEffect(() => {
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    const coarsePointer = window.matchMedia?.('(pointer: coarse)')
    const connection = (navigator as Navigator & { connection?: NetworkConnection }).connection
    const webgl = supportsWebgl()
    const update = () => setCapabilities({
      reducedMotion: reducedMotion?.matches ?? false,
      coarsePointer: coarsePointer?.matches ?? false,
      saveData: connection?.saveData ?? false,
      webgl,
      ready: true,
    })

    reducedMotion?.addEventListener('change', update)
    coarsePointer?.addEventListener('change', update)
    connection?.addEventListener?.('change', update)
    update()

    return () => {
      reducedMotion?.removeEventListener('change', update)
      coarsePointer?.removeEventListener('change', update)
      connection?.removeEventListener?.('change', update)
    }
  }, [])

  return capabilities
}
