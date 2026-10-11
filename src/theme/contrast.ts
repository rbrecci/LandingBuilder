import type { Theme } from './schema.ts';

function luminance(color: string): number {
  const channels = [1, 3, 5].map((start) => {
    const channel = Number.parseInt(color.slice(start, start + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

export function contrastRatio(a: string, b: string): number {
  const first = luminance(a);
  const second = luminance(b);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

export type ContrastFailure = {
  path: string;
  foreground: string;
  background: string;
  ratio: number;
};

export function checkThemeContrast(theme: Theme): ContrastFailure[] {
  const { colors } = theme;
  const pairs = [
    { path: 'colors.ink/paper', foreground: colors.ink, background: colors.paper },
    { path: 'colors.brandContrast/brand', foreground: colors.brandContrast, background: colors.brand },
    { path: 'colors.accentContrast/accent', foreground: colors.accentContrast, background: colors.accent },
    ...(['dark', 'light', 'brand', 'accent'] as const).map((tone) => ({
      path: `colors.surfaces.${tone}`,
      foreground: colors.surfaces[tone].fg,
      background: colors.surfaces[tone].bg,
    })),
  ];

  return pairs.flatMap((pair) => {
    const ratio = contrastRatio(pair.foreground, pair.background);
    return ratio < 4.5 ? [{ ...pair, ratio }] : [];
  });
}
