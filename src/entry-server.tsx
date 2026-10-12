import { renderToString } from 'react-dom/server'
import { App } from './App.tsx'
import type { Content } from './content/schema.ts'
import { withBase } from './content/withBase.ts'

export function render(content: Content): string {
  return renderToString(<App content={withBase(content, import.meta.env.BASE_URL)} />)
}
