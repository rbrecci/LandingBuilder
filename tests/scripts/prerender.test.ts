import { describe, expect, it } from 'vitest'
import { content } from '../../src/content/load.ts'
import { render } from '../../src/entry-server.tsx'
import { injectAppHtml } from '../../scripts/prerender.ts'

describe('injectAppHtml', () => {
  it('substitui o marcador sem alterar o head nem o base path', () => {
    const html = '<head><meta name="description" content="Cliente"><link href="/site/assets/main.css"></head><body><div id="root"><!--app-html--></div><script src="/site/assets/main.js"></script></body>'
    const appHtml = '<main><h1>Modelo</h1></main>'

    expect(injectAppHtml(html, appHtml)).toBe(
      '<head><meta name="description" content="Cliente"><link href="/site/assets/main.css"></head><body><div id="root"><main><h1>Modelo</h1></main></div><script src="/site/assets/main.js"></script></body>',
    )
  })

  it('falha com mensagem clara quando o marcador não existe', () => {
    expect(() => injectAppHtml('<div id="root"></div>', '<h1>Modelo</h1>')).toThrow(
      'Marcador <!--app-html--> ausente em dist/index.html',
    )
  })

  it('inclui título e crédito com link no HTML renderizado', () => {
    const html = injectAppHtml('<div id="root"><!--app-html--></div>', render(content))
    const root = document.createElement('div')
    root.innerHTML = html

    expect(root.querySelector('h1')).not.toBeNull()
    expect(root.querySelector('footer')?.textContent).toContain('Desenvolvido por RBrecci')
    expect(root.querySelector('footer a[href="https://github.com/rbrecci"]')).not.toBeNull()
    expect(html).not.toContain('gstatic.com')
    expect(html).not.toContain('<canvas')
  })
})
