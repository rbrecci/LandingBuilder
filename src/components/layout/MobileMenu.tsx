import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import './MobileMenu.css';

type NavItem = { id: string; label: string };

type MobileMenuProps = {
  items: NavItem[];
  activeSection: string;
  open: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
};

export function MobileMenu({ items, activeSection, open, onClose, triggerRef }: MobileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = menuRef.current?.querySelectorAll<HTMLElement>('button, a[href]');
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !menuRef.current?.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !menuRef.current?.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [open, onClose, triggerRef]);

  return (
    <div
      ref={menuRef}
      id="mobile-menu"
      className="mobile-menu"
      role="dialog"
      aria-label="Menu de navegação"
      aria-modal="true"
      aria-hidden={!open}
      hidden={!open}
    >
      <div className="mobile-menu__top">
        <span>Explore</span>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Fechar menu">
          Fechar <span aria-hidden="true">×</span>
        </button>
      </div>
      <nav aria-label="Navegação mobile">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            aria-current={activeSection === item.id ? 'location' : undefined}
            onClick={onClose}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
