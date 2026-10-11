import type { FeaturesSection } from '../../content/schema'
import { Badge } from '../../components/ui/Badge'
import { SectionShell } from '../../components/ui/SectionShell'
import { Reveal } from '../../motion/Reveal'
import './Features.css'

export function Features({ section, index, total }: { section: FeaturesSection; index: number; total: number }) {
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
      {section.placeholder && <div className="features__badge"><Badge /></div>}
      <ul className="features__grid">
        {section.data.items.map((item, itemIndex) => (
          <li className="features__item" key={itemIndex}>
            <Reveal className="features__reveal" style={{ transitionDelay: `${itemIndex * 90}ms` }}>
              <article className={`features__card${item.image ? '' : ' features__card--text-only'}`}>
                {item.image && (
                  <img
                    className="features__image"
                    src={item.image.src}
                    alt={item.image.alt}
                    width={item.image.width}
                    height={item.image.height}
                    loading="lazy"
                  />
                )}
                <div className="features__content">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </SectionShell>
  )
}
