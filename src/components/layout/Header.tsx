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
    const elements = navItems
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null);
    let frame: number | null = null;

    const updateActiveSection = () => {
      frame = null;
      if (elements.length === 0) return;

      const atPageEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight;
      if (atPageEnd) {
        setActiveSection(elements[elements.length - 1].id);
        return;
      }

      const reference = window.innerHeight * 0.4;
      const passed = elements.filter((element) => element.getBoundingClientRect().top <= reference);
      setActiveSection((passed[passed.length - 1] ?? elements[0]).id);
    };
    const scheduleUpdate = () => {
      if (frame === null) frame = window.requestAnimationFrame(updateActiveSection);
    };

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });
    scheduleUpdate();

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
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
