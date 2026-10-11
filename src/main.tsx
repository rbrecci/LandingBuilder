import { useEffect } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import 'virtual:client-fonts'
import './styles/base.css'
import './motion/parallax.css'
import './motion/reveal.css'
import { App } from './App.tsx'
import { startScrollDriver, supportsScrollTimeline } from './motion/scrollDriver.ts'
import content from 'virtual:client-content'

const root = document.getElementById('root')!

function ClientApp() {
  useEffect(() => {
    if (!supportsScrollTimeline()) return startScrollDriver(root)
  }, [])

  return <App content={content} />
}

document.documentElement.classList.add('js')

if (root.children.length > 0) {
  hydrateRoot(root, <ClientApp />)
} else {
  createRoot(root).render(<ClientApp />)
}
