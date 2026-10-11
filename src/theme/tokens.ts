import { FONT_CATALOG } from './fonts.ts';
import type { Theme } from './schema.ts';

const radii: Record<Theme['radius'], string> = {
  none: '0',
  sm: '0.375rem',
  md: '0.75rem',
  lg: '1.25rem',
};

const motionFactors: Record<Theme['motion']['level'], number> = {
  off: 0,
  subtle: 0.5,
  bold: 1,
};

export function themeToCss(theme: Theme): string {
  const { colors } = theme;
  const display = FONT_CATALOG.find((font) => font.id === theme.fonts.display)!;
  const body = FONT_CATALOG.find((font) => font.id === theme.fonts.body)!;
  const variables: Record<string, string> = {
    '--color-paper': colors.paper,
    '--color-ink': colors.ink,
    '--color-brand': colors.brand,
    '--color-brand-contrast': colors.brandContrast,
    '--color-accent': colors.accent,
    '--color-accent-contrast': colors.accentContrast,
    '--color-focus': colors.focus,
    '--font-display': display.stack,
    '--font-body': body.stack,
    '--radius': radii[theme.radius],
    '--density': theme.density,
    '--parallax-range': `${theme.motion.parallaxRangePx * motionFactors[theme.motion.level]}px`,
    '--motion-level': theme.motion.level,
    '--three-ambient': theme.three.ambient,
    '--three-key': theme.three.key,
    '--three-fill': theme.three.fill,
  };

  for (const tone of ['dark', 'light', 'brand', 'accent'] as const) {
    variables[`--surface-${tone}-bg`] = colors.surfaces[tone].bg;
    variables[`--surface-${tone}-fg`] = colors.surfaces[tone].fg;
  }

  return `:root{${Object.entries(variables).map(([name, value]) => `${name}:${value}`).join(';')}}`;
}
