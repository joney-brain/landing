// Renders the real component tree with react-dom/server so the pre-render step
// ships the same markup the browser will produce. Output lands in .build/, not
// in dist/, so it can never end up in the uploaded folder.
import { build } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { BASE_PATH } from '../site.config.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = '.build'

await build({
  root,
  // Must match the client build in vite.config.ts, or the pre-rendered markup
  // ships asset URLs the client build never produced.
  base: BASE_PATH,
  logLevel: 'error',
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(root, 'src') } },
  build: {
    ssr: 'scripts/entry-server.tsx',
    outDir,
    emptyOutDir: true,
    minify: false,
  },
})

const entry = path.resolve(root, outDir, 'entry-server.js')
const { render } = await import(pathToFileURL(entry).href)
const html = render()

// The pre-render is only safe if the client's first render produces the same
// tree. Render twice and diff: any Date/Math.random creeping into the markup
// shows up here as a byte difference, and hydration would then silently throw
// the server HTML away.
const again = render()
if (again !== html) {
  console.error('pre-render is not deterministic — hydration would discard it')
  for (let i = 0; i < Math.min(html.length, again.length); i++) {
    if (html[i] !== again[i]) {
      console.error(`  first difference at byte ${i}:`)
      console.error(`    run 1: ${JSON.stringify(html.slice(i - 60, i + 60))}`)
      console.error(`    run 2: ${JSON.stringify(again.slice(i - 60, i + 60))}`)
      break
    }
  }
  process.exit(1)
}

mkdirSync(path.resolve(root, '.build'), { recursive: true })
const out = path.resolve(root, '.build', 'rendered.html')
writeFileSync(out, html)
rmSync(path.resolve(root, outDir, 'entry-server.js'), { force: true })

const words = html
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
console.log(
  `pre-rendered ${(html.length / 1024).toFixed(1)} KB of markup ` +
    `(${words.split(' ').length} words) -> .build/rendered.html`,
)
