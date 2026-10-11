import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Badge } from '../../src/components/ui/Badge.tsx';
import { Button } from '../../src/components/ui/Button.tsx';
import { SectionShell } from '../../src/components/ui/SectionShell.tsx';

afterEach(cleanup);

describe('Button', () => {
  it('protege o link externo', () => {
    render(<Button href="https://example.com" external>Visitar</Button>);

    const link = screen.getByRole('link', { name: 'Visitar' });
    expect(link.getAttribute('rel')?.split(' ')).toEqual(
      expect.arrayContaining(['noopener', 'noreferrer']),
    );
  });

  it('renderiza um botão quando não recebe href', () => {
    render(<Button variant="outline">Enviar</Button>);

    expect(screen.getByRole('button', { name: 'Enviar' })).toBeTruthy();
  });
});

describe('SectionShell', () => {
  it('associa o título à seção e mostra o progresso formatado', () => {
    render(
      <SectionShell
        id="sobre"
        tone="dark"
        eyebrow="Nossa história"
        title="Sobre nós"
        intro="Conheça nossa equipe."
        index={1}
        total={8}
      >
        <p>Conteúdo da seção.</p>
      </SectionShell>,
    );

    const section = screen.getByRole('region', { name: 'Sobre nós' });
    const heading = screen.getByRole('heading', { level: 2, name: 'Sobre nós' });
    expect(section.getAttribute('aria-labelledby')).toBe(heading.id);
    expect(section.classList.contains('tone-dark')).toBe(true);
    expect(section.textContent).toContain('01 / 08');
  });
});

describe('Badge', () => {
  it('identifica o conteúdo de exemplo', () => {
    render(<Badge />);

    expect(screen.getByText('Exemplo')).toBeTruthy();
  });
});
