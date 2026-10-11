import { readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'
import { pathToFileURL } from 'node:url'

const extensions = new Set(['.json', '.md', '.ts', '.tsx', '.css'])
const forbidden = new Set([0x2014, 0x2013, 0x2212])

function checkPath(path: string): string[] {
  const info = statSync(path)
  if (info.isDirectory()) {
    const entries = readdirSync(path, { withFileTypes: true })
    const matches: string[] = []
    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue
      matches.push(...checkPath(join(path, entry.name)))
    }
    return matches
  }

  if (!info.isFile() || !extensions.has(extname(path).toLowerCase())) return []

  const lines = readFileSync(path, 'utf8').split(/\r?\n/)
  const matches: string[] = []
  lines.forEach((line, index) => {
    if ([...line].some((character) => forbidden.has(character.codePointAt(0)!))) {
      matches.push(`${path}:${index + 1}`)
    }
  })
  return matches
}

export function checkText(paths: string[]): string[] {
  return paths.flatMap(checkPath)
}

function main(): void {
  const paths = process.argv.slice(2)
  if (paths.length === 0) {
    console.error('Uso: node scripts/check-text.ts <caminhos...>')
    process.exitCode = 1
    return
  }

  try {
    const matches = checkText(paths)
    matches.forEach((match) => console.log(match))
    if (matches.length > 0) process.exitCode = 1
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main()
