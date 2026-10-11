import type { StatsSection } from '../../content/schema'
import { Badge } from '../../components/ui/Badge'
import { SectionShell } from '../../components/ui/SectionShell'
import { Reveal } from '../../motion/Reveal'
import './Stats.css'

export function Stats({ section, index, total }: { section: StatsSection; index: number; total: number }) {
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
      {section.placeholder && <div className="stats__badge"><Badge /></div>}
      <ul className="stats__list">
        {section.data.items.map((item, itemIndex) => (
          <li className="stats__item" key={`${item.value}-${itemIndex}`}>
            <Reveal>
              <strong className="stats__value">{item.value}</strong>
              <span className="stats__label">{item.label}</span>
              {item.note && <span className="stats__note">{item.note}</span>}
            </Reveal>
          </li>
        ))}
      </ul>
    </SectionShell>
  )
}
