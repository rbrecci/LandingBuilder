import type { Content, Section } from './schema.ts'

type LinkContext = { sections: Pick<Section, 'type' | 'id' | 'enabled'>[] }

export function resolveLink(to: string, ctx: LinkContext): { href: string; external: boolean } {
  if (to.startsWith('#')) {
    const id = to.slice(1)
    if (!/^[a-z][a-z0-9-]*$/.test(id) || !ctx.sections.some((section) => section.enabled && section.id === id)) {
      throw new Error(`Âncora inválida ou desabilitada: ${to}`)
    }
    return { href: to, external: false }
  }

  if (to.startsWith('https://')) {
    const url = new URL(to)
    if (!url.hostname) throw new Error(`Link inválido: ${to}`)
    return { href: to, external: true }
  }

  if (/^tel:\+[1-9]\d{1,14}$/.test(to)) return { href: to, external: false }
  if (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return { href: to, external: false }
  if (/^wa:[1-9]\d+$/.test(to)) return { href: `https://wa.me/${to.slice(3)}`, external: true }

  throw new Error(`Link inválido: ${to}`)
}

export function collectLinkErrors(content: Content): string[] {
  const errors: string[] = []
  const check = (to: string, path: string) => {
    try {
      resolveLink(to, content)
    } catch (error) {
      errors.push(`${path}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  check(content.nav.cta.to, 'nav.cta.to')
  content.footer.links.forEach((link, index) => check(link.to, `footer.links.${index}.to`))
  content.sections.forEach((section, index) => {
    if (section.type === 'hero') {
      section.data.ctas.forEach((cta, ctaIndex) => check(cta.to, `sections.${index}.data.ctas.${ctaIndex}.to`))
    }
  })

  return errors
}
