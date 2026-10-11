import contentRaw from '../../client/content.json'
import themeRaw from '../../client/theme.json'
import { ZodError } from 'zod'
import { contentSchema, type Content } from './schema.ts'
import { themeSchema, type Theme } from '../theme/schema.ts'

function formatError(label: string, error: ZodError): Error {
  const details = error.issues.map((issue) => {
    const path = issue.path.length ? issue.path.join('.') : '(raiz)'
    return `${path}: ${issue.message}`
  })
  return new Error(`${label} inválido:\n${details.join('\n')}`)
}

export function loadContent(raw: unknown): Content {
  const result = contentSchema.safeParse(raw)
  if (!result.success) throw formatError('Conteúdo', result.error)
  return result.data
}

export function loadTheme(raw: unknown): Theme {
  const result = themeSchema.safeParse(raw)
  if (!result.success) throw formatError('Tema', result.error)
  return result.data
}

export const content = loadContent(contentRaw)
export const theme = loadTheme(themeRaw)
