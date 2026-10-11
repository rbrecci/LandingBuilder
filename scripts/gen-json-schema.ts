import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { z } from 'zod'
import { contentSchema } from '../src/content/schema.ts'
import { themeSchema } from '../src/theme/schema.ts'

const clientDirectory = join(dirname(fileURLToPath(import.meta.url)), '..', 'client')

await mkdir(clientDirectory, { recursive: true })
await Promise.all([
  writeFile(join(clientDirectory, 'content.schema.json'), `${JSON.stringify(z.toJSONSchema(contentSchema), null, 2)}\n`),
  writeFile(join(clientDirectory, 'theme.schema.json'), `${JSON.stringify(z.toJSONSchema(themeSchema), null, 2)}\n`),
])
