import type { ReactNode } from 'react';
import './SectionShell.css';

type SectionTone = 'dark' | 'light' | 'brand' | 'accent';

type SectionShellProps = {
  id: string;
  tone: SectionTone;
  eyebrow?: string;
  title: string;
  intro?: string;
  index: number;
  total: number;
  children?: ReactNode;
};

export function SectionShell({
  id,
  tone,
  eyebrow,
  title,
  intro,
  index,
  total,
  children,
}: SectionShellProps) {
  const headingId = `${id}-title`;
  const count = `${String(index).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;

  return (
    <section id={id} className={`section-shell tone-${tone}`} aria-labelledby={headingId}>
      <div className="container">
        <header className="section-shell__header">
          <div className="section-shell__meta">
            {eyebrow && <span className="section-shell__eyebrow">{eyebrow}</span>}
            <span className="section-shell__count">{count}</span>
          </div>
          <h2 id={headingId}>{title}</h2>
          {intro && <p className="section-shell__intro">{intro}</p>}
        </header>
        {children}
      </div>
    </section>
  );
}
