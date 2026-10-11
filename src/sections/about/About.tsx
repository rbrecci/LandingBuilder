import type { AboutSection } from '../../content/schema'
import { Badge } from '../../components/ui/Badge'
import { SectionShell } from '../../components/ui/SectionShell'
import { Parallax } from '../../motion/Parallax'
import './About.css'

export function About({ section, index, total }: { section: AboutSection; index: number; total: number }) {
  const { image, paragraphs, highlight } = section.data
  const speed = section.parallax === 'off' ? 0 : section.parallax === 'bold' ? 0.5 : 0.25

  return (
    <SectionShell
      id={section.id}
      tone={section.tone}
      eyebrow={section.eyebrow}
      title={section.title}
      intro={section.intro}
      index={index}
      total={total}
    >
      <div className="about__layout">
        <Parallax className="about__media" speed={speed}>
          <img
            className="about__image"
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            loading="lazy"
          />
        </Parallax>
        <div className="about__content">
          {section.placeholder && <Badge />}
          <div className="about__paragraphs">
            {paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
          </div>
          {highlight && (
            <div className="about__highlight">
              <strong className="about__highlight-value">{highlight.value}</strong>
              <span className="about__highlight-label">{highlight.label}</span>
            </div>
          )}
        </div>
      </div>
    </SectionShell>
  )
}
