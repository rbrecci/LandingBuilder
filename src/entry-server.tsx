import { renderToString } from 'react-dom/server'
import { App } from './App.tsx'
import type { Content } from './content/schema.ts'

export function render(content: Content): string {
  return renderToString(<App content={content} />)
}
