import type { Content } from './schema.ts'

export function joinBase(path: string, base: string): string {
  if (!path.startsWith('/client/') || base === '/') return path

  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base
  return `${normalizedBase}${path}`
}

export function withBase(content: Content, base: string): Content {
  function transform(value: unknown): unknown {
    if (typeof value === 'string') return joinBase(value, base)
    if (Array.isArray(value)) return value.map(transform)
    if (value !== null && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, transform(item)]))
    }
    return value
  }

  return transform(content) as Content
}
