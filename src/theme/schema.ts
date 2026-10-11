import { z } from 'zod';
import { FONT_CATALOG, type FontId } from './fonts.ts';

const colorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const surfaceSchema = z.object({ bg: colorSchema, fg: colorSchema });

export const themeSchema = z.object({
  colors: z.object({
    paper: colorSchema,
    ink: colorSchema,
    brand: colorSchema,
    brandContrast: colorSchema,
    accent: colorSchema,
    accentContrast: colorSchema,
    focus: colorSchema,
    surfaces: z.object({
      dark: surfaceSchema,
      light: surfaceSchema,
      brand: surfaceSchema,
      accent: surfaceSchema,
    }),
  }),
  fonts: z.object({
    display: z.enum(FONT_CATALOG.map((font) => font.id) as [FontId, ...FontId[]]),
    body: z.enum(FONT_CATALOG.map((font) => font.id) as [FontId, ...FontId[]]),
  }),
  radius: z.enum(['none', 'sm', 'md', 'lg']),
  density: z.enum(['compact', 'regular', 'airy']),
  motion: z.object({
    level: z.enum(['off', 'subtle', 'bold']),
    parallaxRangePx: z.number().min(0).max(80),
  }),
  three: z.object({
    ambient: colorSchema,
    key: colorSchema,
    fill: colorSchema,
  }),
});

export type Theme = z.infer<typeof themeSchema>;
