import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Content, Section } from '../../src/content/schema.ts';
import { Header } from '../../src/components/layout/Header.tsx';

const brand: Content['brand'] = {
  name: 'Casa Exemplo',
  shortName: 'Casa',
  tagline: 'Um lugar para conhecer',
  logo: { src: '/client/logo.svg', alt: 'Casa Exemplo', width: 120, height: 40 },
};

const sections = [
  { id: 'inicio', type: 'hero', enabled: true, navLabel: 'Início' },
  { id: 'sobre', type: 'about', enabled: true, navLabel: 'Sobre' },
  { id: 'recursos', type: 'features', enabled: true, navLabel: 'Recursos' },
  { id: 'sem-menu', type: 'gallery', enabled: true },
  { id: 'oculta', type: 'contact', enabled: false, navLabel: 'Oculta' },
] as Section[];

let observerCallback: IntersectionObserverCallback;
const observe = vi.fn();
const disconnect = vi.fn();

beforeEach(() => {
  observe.mockClear();
  disconnect.mockClear();
  vi.stubGlobal('IntersectionObserver', vi.fn(function (callback: IntersectionObserverCallback) {
    observerCallback = callback;
    return { observe, disconnect };
  }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.body.style.overflow = '';
});

describe('Header', () => {
  it('mostra o link de pular como primeiro elemento focável e filtra a navegação', () => {
    render(<Header brand={brand} sections={sections} />);

    const focusables = document.querySelectorAll('a[href], button:not([disabled])');
    expect(focusables[0]).toBe(screen.getByRole('link', { name: 'Pular para o conteúdo' }));
    expect(focusables[0].getAttribute('href')).toBe('#conteudo');

    const desktop = screen.getByRole('navigation', { name: 'Navegação principal' });
    expect(within(desktop).getAllByRole('link').map((link) => link.textContent)).toEqual(['Início', 'Sobre', 'Recursos']);
    expect(within(desktop).queryByText('Oculta')).toBeNull();
  });

  it('abre o menu, circula o foco, navega e devolve o foco ao botão', () => {
    render(<Header brand={brand} sections={sections} />);
    const open = screen.getByRole('button', { name: 'Abrir menu' });
    fireEvent.click(open);

    const menu = screen.getByRole('dialog', { name: 'Menu de navegação' });
    const close = within(menu).getByRole('button', { name: 'Fechar menu' });
    const links = within(menu).getAllByRole('link');
    expect(open.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(close);
    expect(document.body.style.overflow).toBe('hidden');
    expect(links.map((link) => link.textContent)).toEqual(['Início', 'Sobre', 'Recursos']);

    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(links[links.length - 1]);
    fireEvent.keyDown(window, { key: 'Tab' });
    expect(document.activeElement).toBe(close);

    fireEvent.click(within(menu).getByRole('link', { name: 'Sobre' }));
    expect(open.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(open);
    expect(document.body.style.overflow).toBe('');

    fireEvent.click(open);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(open.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(open);
  });

  it('marca a seção visível e observa apenas as seções do menu', () => {
    for (const section of sections) {
      const element = document.createElement('section');
      element.id = section.id;
      document.body.append(element);
    }

    render(<Header brand={brand} sections={sections} />);
    expect(observe.mock.calls.map(([element]) => (element as HTMLElement).id)).toEqual(['inicio', 'sobre', 'recursos']);
    expect(vi.mocked(IntersectionObserver).mock.calls[0]?.[1]).toMatchObject({ rootMargin: '-25% 0px -45% 0px' });

    act(() => {
      observerCallback([
        { target: document.getElementById('sobre')!, isIntersecting: true, intersectionRatio: 0.5 },
      ] as unknown as IntersectionObserverEntry[], {} as IntersectionObserver);
    });

    const desktop = screen.getByRole('navigation', { name: 'Navegação principal' });
    expect(within(desktop).getByRole('link', { name: 'Sobre' }).getAttribute('aria-current')).toBe('location');
    expect(within(desktop).getByRole('link', { name: 'Início' }).getAttribute('aria-current')).toBeNull();

    for (const section of sections) document.getElementById(section.id)?.remove();
  });

  it('renderiza a barra de progresso como elemento decorativo', () => {
    const { container } = render(<Header brand={brand} sections={sections} />);
    const progress = container.querySelector('.scroll-progress');
    expect(progress?.getAttribute('aria-hidden')).toBe('true');
    expect(progress?.hasAttribute('role')).toBe(false);
  });
});
