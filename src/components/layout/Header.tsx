import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Content, Section } from '../../content/schema.ts';
import { MobileMenu } from './MobileMenu.tsx';
import { ScrollProgress } from './ScrollProgress.tsx';
import './Header.css';

export function Header({ brand, sections }: { brand: Content['brand']; sections: Section[] }) {
  const navItems = useMemo(
    () => sections.filter((section) => section.enabled && section.navLabel).map((section) => ({
      id: section.id,
      label: section.navLabel!,
    })),
    [sections],
  );
  const [activeSection, setActiveSection] = useState(navItems[0]?.id ?? '');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) setActiveSection(visible[0].target.id);
    }, { rootMargin: '-25% 0px -45% 0px', threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] });

    for (const item of navItems) {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [navItems]);

  return (
    <>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <ScrollProgress />
      <header className="site-header">
        <a className="site-header__brand" href={`#${sections[0]?.id ?? 'conteudo'}`}>
          <img
            src={brand.logo.src}
            alt=""
            width={brand.logo.width}
            height={brand.logo.height}
          />
          <span>
            <strong>{brand.name}</strong>
            <small>{brand.tagline}</small>
          </span>
        </a>
        <nav className="site-header__nav" aria-label="Navegação principal">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              aria-current={activeSection === item.id ? 'location' : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <button
          ref={menuButtonRef}
          className="site-header__toggle"
          type="button"
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen(true)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </header>
      <MobileMenu
        items={navItems}
        activeSection={activeSection}
        open={menuOpen}
        onClose={closeMenu}
        triggerRef={menuButtonRef}
      />
    </>
  );
}
