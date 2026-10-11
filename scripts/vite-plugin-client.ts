import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'
import { contentSchema, type Content } from '../src/content/schema.ts'
import { checkThemeContrast } from '../src/theme/contrast.ts'
import { FONT_CATALOG } from '../src/theme/fonts.ts'
import { themeSchema, type Theme } from '../src/theme/schema.ts'
import { themeToCss } from '../src/theme/tokens.ts'

type ClientInput = { content?: unknown; theme?: unknown }

const virtualId = 'virtual:client-fonts'
const resolvedVirtualId = `\0${virtualId}`

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function parseContent(input: unknown): Content {
  const result = contentSchema.safeParse(input)
  if (!result.success) {
    throw new Error(result.error.issues.map((issue) => `content.${issue.path.join('.')}: ${issue.message}`).join('\n'))
  }
  return result.data
}

function parseTheme(input: unknown): Theme {
  const result = themeSchema.safeParse(input)
  if (!result.success) {
    throw new Error(result.error.issues.map((issue) => `theme.${issue.path.join('.')}: ${issue.message}`).join('\n'))
  }
  const contrastErrors = checkThemeContrast(result.data)
  if (contrastErrors.length) {
    throw new Error(contrastErrors.map((error) => `theme.${error.path}: contraste ${error.ratio.toFixed(2)} abaixo de 4.5`).join('\n'))
  }
  return result.data
}

function renderHead(content: Content, theme: Theme) {
  const { site, brand, business } = content
  const meta = [
    `<title>${escapeHtml(site.title)}</title>`,
    `<meta name="description" content="${escapeHtml(site.description)}">`,
    `<meta name="theme-color" content="${theme.colors.brand}">`,
    `<link rel="icon" href="${escapeHtml(site.favicon)}">`,
    '<meta property="og:type" content="website">',
    `<meta property="og:title" content="${escapeHtml(site.title)}">`,
    `<meta property="og:description" content="${escapeHtml(site.description)}">`,
    `<meta property="og:image" content="${escapeHtml(site.url ? new URL(site.ogImage.slice(1), site.url).href : site.ogImage)}">`,
  ]

  if (site.url) {
    meta.push(`<link rel="canonical" href="${escapeHtml(site.url)}">`)
    meta.push(`<meta property="og:url" content="${escapeHtml(site.url)}">`)
  }
  if (!site.indexable) meta.push('<meta name="robots" content="noindex, nofollow">')

  if (business?.address) {
    const structuredData: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': business.schemaType,
      name: brand.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: business.address.street,
        addressLocality: business.address.city,
        addressRegion: business.address.region,
        postalCode: business.address.postalCode,
        addressCountry: business.address.country,
      },
    }
    if (business.hoursConfirmed) {
      if (business.phone) structuredData.telephone = business.phone
      if (business.hours?.length) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        structuredData.openingHoursSpecification = business.hours.map(({ day, opens, closes }) => ({
          '@type': 'OpeningHoursSpecification', dayOfWeek: days[day], opens, closes,
        }))
      }
    }
    meta.push(`<script type="application/ld+json">${JSON.stringify(structuredData).replace(/</g, '\\u003c')}</script>`)
  }

  meta.push(`<style id="theme-vars">${themeToCss(theme)}</style>`)
  return meta.join('\n    ')
}

export default function clientPlugin(input: ClientInput = {}): Plugin {
  let root = process.cwd()

  async function readClient(name: 'content' | 'theme') {
    if (input[name] !== undefined) return input[name]
    return JSON.parse(await readFile(resolve(root, 'client', `${name}.json`), 'utf8')) as unknown
  }

  return {
    name: 'landing-client',
    configResolved(config) {
      root = config.root
    },
    async transformIndexHtml(html) {
      const content = parseContent(await readClient('content'))
      const theme = parseTheme(await readClient('theme'))
      if (!html.includes('<!--head-meta-->')) throw new Error('index.html: marcador <!--head-meta--> ausente')
      return html.replace(/<title>[^<]*<\/title>/i, '').replace('<!--head-meta-->', renderHead(content, theme))
    },
    resolveId(id) {
      if (id === virtualId) return resolvedVirtualId
    },
    async load(id) {
      if (id !== resolvedVirtualId) return
      const theme = parseTheme(await readClient('theme'))
      const fonts = [theme.fonts.display, theme.fonts.body]
      const imports = fonts.flatMap((font) => FONT_CATALOG.find((entry) => entry.id === font)?.imports ?? [])
      return [...new Set(imports)].map((path) => `import '${path}'`).join('\n')
    },
  }
}
