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

let animationFrameCallback: FrameRequestCallback | undefined;
const originalScrollY = Object.getOwnPropertyDescriptor(window, 'scrollY');
const originalInnerHeight = Object.getOwnPropertyDescriptor(window, 'innerHeight');
const originalScrollHeight = Object.getOwnPropertyDescriptor(document.documentElement, 'scrollHeight');

beforeEach(() => {
  animationFrameCallback = undefined;
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    animationFrameCallback = callback;
    return 1;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 1000 });
  Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 3000 });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  if (originalScrollY) Object.defineProperty(window, 'scrollY', originalScrollY);
  if (originalInnerHeight) Object.defineProperty(window, 'innerHeight', originalInnerHeight);
  if (originalScrollHeight) Object.defineProperty(document.documentElement, 'scrollHeight', originalScrollHeight);
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

  it('marca a seção conforme a linha de referência e o fim da página', () => {
    for (const section of sections) {
      const element = document.createElement('section');
      element.id = section.id;
      document.body.append(element);
    }

    render(<Header brand={brand} sections={sections} />);
    const desktop = screen.getByRole('navigation', { name: 'Navegação principal' });
    const runFrame = () => {
      const callback = animationFrameCallback;
      animationFrameCallback = undefined;
      act(() => callback?.(0));
    };
    const setTop = (id: string, top: number) => {
      vi.spyOn(document.getElementById(id)!, 'getBoundingClientRect').mockReturnValue({ top } as DOMRect);
    };
    const activeLabel = () => within(desktop).getAllByRole('link')
      .find((link) => link.getAttribute('aria-current') === 'location')?.textContent;

    setTop('inicio', 600);
    setTop('sobre', 800);
    setTop('recursos', 1000);
    runFrame();
    expect(activeLabel()).toBe('Início');

    setTop('inicio', -700);
    setTop('sobre', 200);
    setTop('recursos', 500);
    fireEvent.scroll(window);
    runFrame();
    expect(activeLabel()).toBe('Sobre');

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 2000 });
    fireEvent.scroll(window);
    runFrame();
    expect(activeLabel()).toBe('Recursos');

    for (const section of sections) document.getElementById(section.id)?.remove();
  });

  it('renderiza a barra de progresso como elemento decorativo', () => {
    const { container } = render(<Header brand={brand} sections={sections} />);
    const progress = container.querySelector('.scroll-progress');
    expect(progress?.getAttribute('aria-hidden')).toBe('true');
    expect(progress?.hasAttribute('role')).toBe(false);
  });
});
