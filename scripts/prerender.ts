import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { contentSchema } from '../src/content/schema.ts'

const marker = '<!--app-html-->'

export function injectAppHtml(html: string, appHtml: string): string {
  if (!html.includes(marker)) {
    throw new Error('Marcador <!--app-html--> ausente em dist/index.html')
  }

  return html.replace(marker, appHtml)
}

async function prerender(): Promise<void> {
  const htmlPath = resolve('dist/index.html')
  const serverPath = pathToFileURL(resolve('dist-ssr/entry-server.js')).href
  const content = contentSchema.parse(JSON.parse(await readFile(resolve('client/content.json'), 'utf8')))
  const { render } = (await import(serverPath)) as {
    render: (value: typeof content) => string
  }
  const html = await readFile(htmlPath, 'utf8')

  await writeFile(htmlPath, injectAppHtml(html, render(content)))
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  prerender().catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
}
