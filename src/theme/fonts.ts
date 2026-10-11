export const FONT_CATALOG = [
  {
    id: 'barlow-condensed',
    label: 'Barlow Condensed',
    family: 'Barlow Condensed',
    stack: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
    imports: [
      '@fontsource/barlow-condensed/700.css',
      '@fontsource/barlow-condensed/800.css',
      '@fontsource/barlow-condensed/900.css',
    ],
  },
  {
    id: 'dm-sans',
    label: 'DM Sans',
    family: 'DM Sans Variable',
    stack: "'DM Sans Variable', Arial, Helvetica, sans-serif",
    imports: ['@fontsource-variable/dm-sans/wght.css'],
  },
  {
    id: 'outfit',
    label: 'Outfit',
    family: 'Outfit Variable',
    stack: "'Outfit Variable', Arial, Helvetica, sans-serif",
    imports: ['@fontsource-variable/outfit/wght.css'],
  },
  {
    id: 'space-grotesk',
    label: 'Space Grotesk',
    family: 'Space Grotesk Variable',
    stack: "'Space Grotesk Variable', Arial, Helvetica, sans-serif",
    imports: ['@fontsource-variable/space-grotesk/wght.css'],
  },
  {
    id: 'inter',
    label: 'Inter',
    family: 'Inter Variable',
    stack: "'Inter Variable', Arial, Helvetica, sans-serif",
    imports: ['@fontsource-variable/inter/wght.css'],
  },
  {
    id: 'fraunces',
    label: 'Fraunces',
    family: 'Fraunces Variable',
    stack: "'Fraunces Variable', Georgia, 'Times New Roman', serif",
    imports: ['@fontsource-variable/fraunces/wght.css'],
  },
] as const;

export type FontId = (typeof FONT_CATALOG)[number]['id'];
