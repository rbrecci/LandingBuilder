import type { TestimonialsSection } from '../../content/schema';
import { Badge } from '../../components/ui/Badge';
import { SectionShell } from '../../components/ui/SectionShell';
import { Reveal } from '../../motion/Reveal';
import './Testimonials.css';

export function Testimonials({ section, index, total }: { section: TestimonialsSection; index: number; total: number }) {
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
      <div className="testimonials">
        {(section.placeholder || !section.data.consentConfirmed) && (
          <div className="testimonials__badge"><Badge /></div>
        )}
        <ul className="testimonials__list">
          {section.data.items.map((item, itemIndex) => (
            <li className="testimonials__item" key={`${item.author}-${itemIndex}`}>
              <Reveal className="testimonials__reveal">
                <figure className="testimonials__card">
                  <blockquote className="testimonials__quote">
                    <p>{item.quote}</p>
                  </blockquote>
                  <figcaption className="testimonials__attribution">
                    <strong>{item.author}</strong>
                    {item.role && <span>{item.role}</span>}
                  </figcaption>
                </figure>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </SectionShell>
  );
}
