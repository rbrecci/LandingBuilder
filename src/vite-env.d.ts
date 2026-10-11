/// <reference types="vite/client" />

declare module 'virtual:client-fonts';

declare module 'virtual:client-content' {
  import type { Content } from './content/schema.ts'

  const content: Content
  export default content
}
