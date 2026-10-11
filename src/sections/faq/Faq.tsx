import type { FaqSection } from '../../content/schema.ts'
import { Reveal } from '../../motion/Reveal.tsx'
import { SectionShell } from '../../components/ui/SectionShell.tsx'
import './Faq.css'

export function Faq({ section, index, total }: { section: FaqSection; index: number; total: number }) {
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
      <Reveal className="faq-list">
        {section.data.items.map((item) => (
          <details className="faq-item" key={item.question}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </Reveal>
    </SectionShell>
  )
}
