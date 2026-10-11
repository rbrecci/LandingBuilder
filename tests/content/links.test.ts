import { describe, expect, it } from 'vitest';
import { collectLinkErrors, resolveLink } from '../../src/content/links.ts';

const context = {
  sections: [
    { type: 'hero', id: 'hero', enabled: true },
    { type: 'contact', id: 'contact', enabled: true },
    { type: 'faq', id: 'faq', enabled: false },
  ],
} as unknown as Parameters<typeof resolveLink>[1];

const validContent = {
  schemaVersion: 1,
  site: {
    lang: 'pt-BR',
    title: 'Uma landing de exemplo',
    description: 'Uma descrição de exemplo com tamanho suficiente para apresentar o site aos visitantes.',
    indexable: false,
    ogImage: '/client/og.jpg',
    favicon: '/client/favicon.svg',
    demoBanner: { enabled: true, text: 'Exemplo' },
  },
  brand: {
    name: 'Exemplo',
    shortName: 'Exemplo',
    tagline: 'Uma marca de exemplo',
    logo: { src: '/client/logo.svg', alt: 'Logo da marca Exemplo', width: 120, height: 40 },
  },
  nav: { cta: { label: 'Contato', to: '#contact' } },
  sections: [
    {
      type: 'hero',
      id: 'hero',
      enabled: true,
      title: 'Uma landing de exemplo',
      data: {
        headline: 'Conheça a marca Exemplo',
        subheadline: 'Uma experiência feita para você.',
        ctas: [{ label: 'Fale conosco', to: '#contact', variant: 'primary' }],
        model: {
          kind: 'medal',
          medal: { texture: '/client/logo-face.png', thickness: 0.16 },
          poster: { src: '/client/model-poster.webp', alt: 'Medalha da marca', width: 800, height: 800 },
          alt: 'Medalha da marca Exemplo',
        },
        layers: [],
        status: false,
      },
    },
    {
      type: 'contact',
      id: 'contact',
      enabled: true,
      title: 'Contato',
      data: { channels: [], closing: 'Entre em contato.' },
    },
  ],
  footer: { links: [{ label: 'Contato', to: '#contact' }] },
} as unknown as Parameters<typeof collectLinkErrors>[0];

describe('resolveLink', () => {
  it('resolve a âncora de uma seção habilitada', () => {
    expect(resolveLink('#contact', context)).toEqual({ href: '#contact', external: false });
  });

  it('rejeita âncora sem seção correspondente', () => {
    expect(() => resolveLink('#ausente', context)).toThrow();
  });

  it('rejeita âncora de seção desabilitada', () => {
    expect(() => resolveLink('#faq', context)).toThrow();
  });

  it('aceita links HTTPS', () => {
    expect(resolveLink('https://example.com', context)).toEqual({
      href: 'https://example.com',
      external: true,
    });
  });

  it('aceita links de telefone', () => {
    expect(resolveLink('tel:+5511999999999', context).href).toBe('tel:+5511999999999');
  });

  it('aceita links de email', () => {
    expect(resolveLink('mailto:contato@example.com', context).href).toBe('mailto:contato@example.com');
  });

  it('converte WhatsApp para wa.me', () => {
    expect(resolveLink('wa:5511999999999', context)).toEqual({
      href: 'https://wa.me/5511999999999',
      external: true,
    });
  });

  it('rejeita WhatsApp com caracteres que não sejam dígitos', () => {
    expect(() => resolveLink('wa:+5511999999999', context)).toThrow();
  });
});

describe('collectLinkErrors', () => {
  it('não retorna erros para links válidos', () => {
    expect(collectLinkErrors(validContent)).toEqual([]);
  });

  it('aponta links inválidos no conteúdo', () => {
    const content = structuredClone(validContent) as unknown as {
      nav: { cta: { to: string } };
      sections: Array<{ data: { ctas?: Array<{ to: string }> } }>;
      footer: { links: Array<{ to: string }> };
    };
    content.nav.cta.to = '#ausente';
    content.sections[0].data.ctas![0].to = 'wa:numero';
    content.footer.links[0].to = '#ausente';

    const errors = collectLinkErrors(content as Parameters<typeof collectLinkErrors>[0]);

    expect(errors).toHaveLength(3);
  });
});
