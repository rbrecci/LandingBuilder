import { useEffect, useState } from 'react'
import type { Content, HeroSection } from '../../content/schema.ts'
import { resolveLink } from '../../content/links.ts'
import { Badge } from '../../components/ui/Badge.tsx'
import { Button } from '../../components/ui/Button.tsx'
import { getOpenStatus } from '../../lib/openNow.ts'
import { Parallax } from '../../motion/Parallax.tsx'
import { Model3D } from '../../three/Model3D.tsx'
import './Hero.css'

type HeroProps = {
  section: HeroSection
  sections: Content['sections']
  business?: Content['business']
  index: number
  total: number
}

export function Hero({ section, sections, business, index, total }: HeroProps) {
  const [status, setStatus] = useState<ReturnType<typeof getOpenStatus> | null>(null)
  const showStatus = section.data.status && Boolean(business?.hours?.length)

  useEffect(() => {
    if (!section.data.status || !business?.hours?.length) return

    const update = () => setStatus(getOpenStatus(business.hours ?? [], new Date(), business.timezone))
    update()
    const interval = window.setInterval(update, 60_000)
    return () => window.clearInterval(interval)
  }, [business, section.data.status])

  const count = `${String(index).padStart(2, '0')} / ${String(total).padStart(2, '0')}`

  return (
    <section id={section.id} className={`hero tone-${section.tone}`} aria-labelledby={`${section.id}-title`}>
      <div className="hero__grid" aria-hidden="true" />
      <div className="hero__layers" aria-hidden="true">
        {section.data.layers.map((layer, layerIndex) => (
          <Parallax className="hero__layer" speed={layer.speed} key={`${layer.src}-${layerIndex}`}>
            <img src={layer.src} alt="" aria-hidden="true" width="1600" height="900" />
          </Parallax>
        ))}
      </div>
      <div className="container hero__container">
        <div className="hero__meta">
          <span>{section.eyebrow ?? section.title}</span>
          <span>{count}</span>
        </div>
        <div className="hero__stage">
          <div className="hero__copy">
            {section.placeholder && <Badge />}
            <Parallax speed={0} className="hero__headline">
              <h1 id={`${section.id}-title`}>{section.data.headline}</h1>
            </Parallax>
            <p className="hero__subheadline">{section.data.subheadline}</p>
            {section.intro && <p className="hero__intro">{section.intro}</p>}
          </div>
          <div className="hero__model">
            <Model3D config={section.data.model} alt={section.data.model.alt} mode="tilt" posterFetchPriority="high" />
          </div>
        </div>
        <div className="hero__bottom">
          {showStatus && status && (
            <p className="hero__status" role="status" data-state={status.state}>{status.text}</p>
          )}
          <div className="hero__actions">
            {section.data.ctas.map((cta) => {
              const { href, external } = resolveLink(cta.to, { sections })
              const variant = cta.variant === 'primary' ? 'primary' : cta.variant === 'ghost' ? 'ghost' : 'outline'
              return <Button key={`${cta.label}-${cta.to}`} href={href} external={external} variant={variant}>{cta.label}</Button>
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
