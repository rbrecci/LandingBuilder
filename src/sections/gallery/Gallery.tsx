import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import type { GallerySection } from '../../content/schema.ts'
import { Badge } from '../../components/ui/Badge.tsx'
import { SectionShell } from '../../components/ui/SectionShell.tsx'
import { Reveal } from '../../motion/Reveal.tsx'
import './Gallery.css'

type DragStart = { pointerId: number; x: number }

export function Gallery({ section, index, total }: { section: GallerySection; index: number; total: number }) {
  const [galleryIndex, setGalleryIndex] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef<DragStart | null>(null)
  const items = section.data.items

  function moveGallery(next: number) {
    const target = Math.max(0, Math.min(next, items.length - 1))
    setGalleryIndex(target)
    trackRef.current?.querySelectorAll<HTMLElement>('.gallery-panel')[target]?.scrollIntoView({
      behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      block: 'nearest',
      inline: 'start',
    })
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault()
      moveGallery(galleryIndex + (event.key === 'ArrowRight' ? 1 : -1))
    }
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse' || event.button !== 0) return
    dragStartRef.current = { pointerId: event.pointerId, x: event.clientX }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const start = dragStartRef.current
    if (event.pointerType !== 'mouse' || !start || start.pointerId !== event.pointerId) return
    dragStartRef.current = null
    const distance = start.x - event.clientX
    if (Math.abs(distance) > 45) moveGallery(galleryIndex + (distance > 0 ? 1 : -1))
  }

  function onScroll() {
    const track = trackRef.current
    if (!track) return
    const left = track.getBoundingClientRect().left
    const panels = Array.from(track.querySelectorAll<HTMLElement>('.gallery-panel'))
    const nearest = panels.reduce((best, panel, current) =>
      Math.abs(panel.getBoundingClientRect().left - left) < Math.abs(panels[best].getBoundingClientRect().left - left) ? current : best, 0)
    setGalleryIndex(nearest)
  }

  return (
    <SectionShell id={section.id} tone={section.tone} eyebrow={section.eyebrow} title={section.title} intro={section.intro} index={index} total={total}>
      <Reveal className="gallery-content">
        <div className="gallery-toolbar">
          {section.placeholder && <Badge />}
          <div className="gallery-controls">
            <span className="gallery-counter" aria-live="polite">{String(galleryIndex + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span>
            <button type="button" aria-label="Imagem anterior" onClick={() => moveGallery(galleryIndex - 1)} disabled={galleryIndex === 0}>←</button>
            <button type="button" aria-label="Próxima imagem" onClick={() => moveGallery(galleryIndex + 1)} disabled={galleryIndex === items.length - 1}>→</button>
          </div>
        </div>
        <div
          ref={trackRef}
          className="gallery-track"
          role="region"
          aria-label="Galeria de imagens"
          tabIndex={0}
          onScroll={onScroll}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => { dragStartRef.current = null }}
          onLostPointerCapture={() => { dragStartRef.current = null }}
        >
          {items.map((item, itemIndex) => (
            <figure className="gallery-panel" key={`${item.src}-${itemIndex}`}>
              <div className="gallery-image">
                <img src={item.src} alt={item.alt} width={item.width} height={item.height} loading="lazy" draggable={false} />
                <span className="gallery-image-number" aria-hidden="true">{String(itemIndex + 1).padStart(2, '0')}</span>
              </div>
              <figcaption>{item.caption}</figcaption>
            </figure>
          ))}
        </div>
      </Reveal>
    </SectionShell>
  )
}
