// Renders the real component tree to static HTML so audits inspect shipped
// markup rather than minified string fragments.
import { build } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { writeFileSync, rmSync } from 'node:fs'

const root = process.cwd()
const outDir = 'dist-ssr'

await build({
  root,
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

const { render } = await import(pathToFileURL(path.resolve(root, outDir, 'entry-server.js')).href)
const html = render()

writeFileSync(path.resolve(root, 'dist/rendered.html'), html)
rmSync(path.resolve(root, outDir), { recursive: true, force: true })
console.log(`rendered ${html.length} chars -> dist/rendered.html`)
