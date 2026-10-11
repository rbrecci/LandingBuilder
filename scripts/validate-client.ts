import { existsSync, readFileSync } from 'node:fs'
import { resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { contentSchema, type Content } from '../src/content/schema.ts'
import { themeSchema } from '../src/theme/schema.ts'
import { checkThemeContrast } from '../src/theme/contrast.ts'
import { checkText } from './check-text.ts'

const root = fileURLToPath(new URL('../', import.meta.url))
const publicRoot = resolve(root, 'public')

function sourcePaths(content: Content): { path: string; src: string }[] {
  const found: { path: string; src: string }[] = [
    { path: 'site.ogImage', src: content.site.ogImage },
    { path: 'site.favicon', src: content.site.favicon },
  ]
  const visit = (value: unknown, path: string) => {
    if (!value || typeof value !== 'object') return
    if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, `${path}.${index}`))
      return
    }
    for (const [key, item] of Object.entries(value)) {
      const itemPath = path ? `${path}.${key}` : key
      if (key === 'src' && typeof item === 'string') found.push({ path: itemPath, src: item })
      visit(item, itemPath)
    }
  }
  visit(content, '')
  return found
}

function validate(dir: string): string[] {
  const errors: string[] = []
  let contentRaw: unknown
  let themeRaw: unknown
  try {
    contentRaw = JSON.parse(readFileSync(resolve(dir, 'content.json'), 'utf8'))
  } catch (error) {
    errors.push(`content.json: ${error instanceof Error ? error.message : String(error)}`)
  }
  try {
    themeRaw = JSON.parse(readFileSync(resolve(dir, 'theme.json'), 'utf8'))
  } catch (error) {
    errors.push(`theme.json: ${error instanceof Error ? error.message : String(error)}`)
  }
  if (errors.length) return errors

  const content = contentSchema.safeParse(contentRaw)
  const theme = themeSchema.safeParse(themeRaw)
  if (!content.success) {
    errors.push(...content.error.issues.map((issue) => `content.${issue.path.join('.') || '(raiz)'}: ${issue.message}`))
  }
  if (!theme.success) {
    errors.push(...theme.error.issues.map((issue) => `theme.${issue.path.join('.') || '(raiz)'}: ${issue.message}`))
  }
  if (!content.success || !theme.success) return errors

  for (const failure of checkThemeContrast(theme.data)) {
    errors.push(`Contraste insuficiente em ${failure.path}: ${failure.ratio.toFixed(2)}; mínimo 4,5.`)
  }

  const enabled = content.data.sections.filter((section) => section.enabled)
  const hero = enabled[0]
  const layerCount = hero.type === 'hero' ? hero.data.layers.length : 0
  const parallaxCount = enabled.filter((section) => section.parallax && section.parallax !== 'off').length
  if (layerCount + parallaxCount > 8) {
    errors.push(`Parallax: ${layerCount + parallaxCount} elementos; máximo 8.`)
  }

  for (const { path, src } of sourcePaths(content.data)) {
    const target = resolve(publicRoot, `.${src}`)
    if (!target.startsWith(publicRoot + sep) || !existsSync(target)) {
      errors.push(`content.${path}: arquivo local ausente ou fora de public/: ${src}`)
    }
  }

  errors.push(...checkText([dir, resolve(root, 'docs')]))
  return errors
}

function main(args: string[]) {
  if (args.length !== 0 && (args.length !== 2 || args[0] !== '--dir')) {
    console.error('Uso: node scripts/validate-client.ts [--dir <pasta>]')
    process.exitCode = 1
    return
  }
  const dir = resolve(root, args[1] ?? 'client')
  const errors = validate(dir)
  if (errors.length) {
    for (const error of errors) console.error(error)
    process.exitCode = 1
    return
  }
  console.log(`Conteúdo e tema válidos em ${dir}`)
}

main(process.argv.slice(2))
