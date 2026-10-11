import type { OffersSection } from '../../content/schema'
import { SectionShell } from '../../components/ui/SectionShell'
import { formatPrice } from '../../lib/formatPrice'
import { Reveal } from '../../motion/Reveal'
import './Offers.css'

export function Offers({ section, index, total }: { section: OffersSection; index: number; total: number }) {
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
      <ul className="offers-grid">
        {section.data.items.map((item, itemIndex) => {
          const price = /^\d+(?:\.\d+)?$/.test(item.price) ? formatPrice(Number(item.price)) : item.price

          return (
            <li key={`${item.name}-${itemIndex}`}>
              <Reveal className="offers-reveal" style={{ transitionDelay: `${itemIndex * 90}ms` }}>
                <article className="offers-card">
                  {item.tag && <span className="offers-card__tag">{item.tag}</span>}
                  <h3 className="offers-card__name">{item.name}</h3>
                  <p className="offers-card__price">{price}</p>
                  <p className="offers-card__unit">{item.unit}</p>
                  {item.validUntil && <p className="offers-card__validity">{item.validUntil}</p>}
                </article>
              </Reveal>
            </li>
          )
        })}
      </ul>
      <p className="offers-note">{section.data.note}</p>
    </SectionShell>
  )
}
