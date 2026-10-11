import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { Showcase3dSection } from '../../content/schema.ts'
import { Badge } from '../../components/ui/Badge.tsx'
import { SectionShell } from '../../components/ui/SectionShell.tsx'
import { Reveal } from '../../motion/Reveal.tsx'
import { Model3D } from '../../three/Model3D.tsx'
import type { Model3DHandle } from '../../three/Model3D.tsx'
import './Showcase3d.css'

export function Showcase3d({ section, index, total }: { section: Showcase3dSection; index: number; total: number }) {
  const model = useRef<Model3DHandle>(null)
  const [paused, setPaused] = useState(false)
  const [interactive, setInteractive] = useState(false)

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    model.current?.rotateBy(event.key === 'ArrowLeft' ? -15 : 15)
  }

  return (
    <SectionShell id={section.id} tone={section.tone} eyebrow={section.eyebrow} title={section.title} intro={section.intro} index={index} total={total}>
      <Reveal className="showcase3d__layout">
        <figure className="showcase3d__figure">
          <Model3D ref={model} config={section.data.model} alt={section.data.model.alt} mode="orbit" autoRotate={section.data.controls && !paused} onInteractiveChange={setInteractive} />
          <figcaption className="showcase3d__info">
            <span className="showcase3d__caption">{section.data.caption}</span>
            {section.placeholder && <Badge />}
            {section.data.controls && interactive && (
              <div className="showcase3d__controls" role="group" aria-label="Controles do modelo 3D" onKeyDown={onKeyDown}>
                <button type="button" onClick={() => model.current?.rotateBy(-15)}>Girar para a esquerda</button>
                <button type="button" onClick={() => model.current?.rotateBy(15)}>Girar para a direita</button>
                <button type="button" aria-pressed={paused} onClick={() => setPaused((value) => !value)}>
                  {paused ? 'Retomar rotação' : 'Pausar rotação'}
                </button>
              </div>
            )}
          </figcaption>
        </figure>
      </Reveal>
    </SectionShell>
  )
}
