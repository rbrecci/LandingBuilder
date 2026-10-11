import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { checkThemeContrast, contrastRatio } from '../../src/theme/contrast.ts';
import { FONT_CATALOG } from '../../src/theme/fonts.ts';
import { themeSchema, type Theme } from '../../src/theme/schema.ts';
import { themeToCss } from '../../src/theme/tokens.ts';

const theme: Theme = {
  colors: {
    paper: '#FFFFFF',
    ink: '#173323',
    brand: '#176B3A',
    brandContrast: '#FFFFFF',
    accent: '#A93F2F',
    accentContrast: '#FFFFFF',
    focus: '#176B3A',
    surfaces: {
      dark: { bg: '#173323', fg: '#FFFFFF' },
      light: { bg: '#FFFFFF', fg: '#173323' },
      brand: { bg: '#176B3A', fg: '#FFFFFF' },
      accent: { bg: '#A93F2F', fg: '#FFFFFF' },
    },
  },
  fonts: { display: 'outfit', body: 'dm-sans' },
  radius: 'md',
  density: 'regular',
  motion: { level: 'subtle', parallaxRangePx: 40 },
  three: { ambient: '#FFFFFF', key: '#176B3A', fill: '#A93F2F' },
};

describe('tema', () => {
  it('aceita o formato previsto e rejeita valores fora dos limites', () => {
    expect(themeSchema.safeParse(theme).success).toBe(true);
    expect(themeSchema.safeParse({ ...theme, fonts: { display: 'missing', body: 'dm-sans' } }).success).toBe(false);
    expect(themeSchema.safeParse({ ...theme, colors: { ...theme.colors, paper: 'white' } }).success).toBe(false);
    expect(themeSchema.safeParse({ ...theme, motion: { level: 'bold', parallaxRangePx: 81 } }).success).toBe(false);
  });

  it('calcula as razões WCAG dos pares de referência', () => {
    expect(contrastRatio('#173323', '#FFFFFF')).toBeGreaterThan(13.68);
    expect(contrastRatio('#173323', '#FFFFFF')).toBeLessThan(13.70);
    expect(contrastRatio('#176B3A', '#FFFFFF')).toBeGreaterThan(6.55);
    expect(contrastRatio('#176B3A', '#FFFFFF')).toBeLessThan(6.57);
    expect(contrastRatio('#A93F2F', '#FFFFFF')).toBeGreaterThan(6.10);
    expect(contrastRatio('#A93F2F', '#FFFFFF')).toBeLessThan(6.12);
  });

  it('aponta um par de texto com contraste inferior a 4,5', () => {
    expect(checkThemeContrast(theme)).toEqual([]);
    const failing = structuredClone(theme);
    failing.colors.surfaces.dark = { bg: '#888888', fg: '#777777' };
    expect(checkThemeContrast(failing)).toEqual([
      expect.objectContaining({ path: 'colors.surfaces.dark', foreground: '#777777', background: '#888888' }),
    ]);
  });

  it('gera todos os tokens CSS do tema', () => {
    const css = themeToCss(theme);
    expect(css).toMatch(/^:root\{/);
    expect(css).toMatch(/\}$/);
    for (const name of [
      '--color-paper', '--color-ink', '--color-brand', '--color-brand-contrast',
      '--color-accent', '--color-accent-contrast', '--color-focus',
      '--surface-dark-bg', '--surface-dark-fg', '--surface-light-bg', '--surface-light-fg',
      '--surface-brand-bg', '--surface-brand-fg', '--surface-accent-bg', '--surface-accent-fg',
      '--font-display', '--font-body', '--radius', '--density', '--parallax-range',
      '--motion-level', '--three-ambient', '--three-key', '--three-fill',
    ]) {
      expect(css).toContain(`${name}:`);
    }
    expect(css).toContain('--parallax-range:20px');
    expect(themeToCss({ ...theme, motion: { level: 'bold', parallaxRangePx: 40 } })).toContain('--parallax-range:40px');
    expect(themeToCss({ ...theme, motion: { level: 'off', parallaxRangePx: 40 } })).toContain('--parallax-range:0px');
  });

  it('referencia CSS instalado para cada fonte do catálogo', () => {
    expect(FONT_CATALOG).toHaveLength(6);
    for (const font of FONT_CATALOG) {
      expect(font.stack).toContain(font.family);
      for (const cssPath of font.imports) {
        const file = resolve(process.cwd(), 'node_modules', cssPath);
        expect(existsSync(file), cssPath).toBe(true);
      }
    }
  });
});
