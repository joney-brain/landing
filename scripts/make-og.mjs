#!/usr/bin/env node
/**
 * Renders the Open Graph card to a 1200x630 bitmap.
 *
 * The template in og/og.html is linked against the site's own compiled
 * stylesheet, so the preview card is generated from the shipped design tokens
 * rather than a hand-maintained duplicate. Output lands in
 * public/assets/og-image.jpg and is picked up by the next `vite build`.
 *
 * Requires: firefox (headless screenshot), a static file server, node.
 */
import { execFileSync } from 'node:child_process'
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  existsSync,
  mkdirSync,
  copyFileSync,
  rmSync,
  statSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'public', 'assets', 'og-image.jpg')
const PORT = 5411
const W = 1200
const H = 630

const distAssets = path.join(ROOT, 'dist', 'assets')
if (!existsSync(distAssets)) {
  console.error('dist/assets not found — run `npm run build` first')
  process.exit(1)
}

const cssFile = readdirSync(distAssets).find((f) => f.endsWith('.css'))
if (!cssFile) {
  console.error('no compiled css in dist/assets')
  process.exit(1)
}

const tpl = readFileSync(path.join(ROOT, 'og', 'og.html'), 'utf8')

// Build a throwaway site that mirrors the real one exactly: /assets/ holds the
// compiled stylesheet, the portrait and the fonts, so every absolute url in
// the stylesheet resolves the way it will in production.
const work = path.join(tmpdir(), `og-render-${process.pid}`)
const assets = path.join(work, 'assets')
mkdirSync(path.join(assets, 'fonts'), { recursive: true })

// dist/assets already contains both the hashed bundles and the copied
// public/fonts tree, so a flat copy of its files is all the page needs.
for (const f of readdirSync(distAssets)) {
  const from = path.join(distAssets, f)
  if (!statSync(from).isFile()) continue
  copyFileSync(from, path.join(assets, f))
}
const distFonts = path.join(distAssets, 'fonts')
if (!existsSync(distFonts)) {
  console.error('no dist/assets/fonts — run `npm run build` first')
  process.exit(1)
}
for (const f of readdirSync(distFonts)) {
  copyFileSync(path.join(distFonts, f), path.join(assets, 'fonts', f))
}

const cssHref = `/assets/${cssFile}`
const page = path.join(work, 'index.html')
writeFileSync(page, tpl.replace('__CSS__', cssHref))

const outPng = path.join(work, 'og.png')

const server = execFileSync('bash', ['-c', `
  cd "${work}" || exit 1
  python3 -m http.server ${PORT} --bind 127.0.0.1 >/dev/null 2>&1 &
  echo $!
`], { encoding: 'utf8' }).trim()

const profile = path.join(work, 'profile')
mkdirSync(profile, { recursive: true })
writeFileSync(
  path.join(profile, 'user.js'),
  [
    'user_pref("ui.prefersReducedMotion", 1);',
    'user_pref("browser.shell.checkDefaultBrowser", false);',
    'user_pref("datareporting.policy.dataSubmissionEnabled", false);',
  ].join('\n'),
)

const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const stop = () => {
  try {
    execFileSync('pkill', ['-9', '-f', `http.server ${PORT}`])
  } catch {
    /* already gone */
  }
  try {
    execFileSync('pkill', ['-9', '-f', 'fire[f]ox'])
  } catch {
    /* already gone */
  }
}

try {
  await wait(2000)
  execFileSync(
    'firefox',
    [
      '--headless',
      '--profile', profile,
      '--screenshot', outPng,
      '--window-size', `${W},${H}`,
      `http://127.0.0.1:${PORT}/`,
    ],
    { stdio: 'ignore', timeout: 150000 },
  )
  stop()
  await wait(1500)

  if (!existsSync(outPng)) throw new Error('screenshot not produced')

  // Crop to exactly 1200x630 and save as JPEG (universally supported for OG).
  execFileSync('python3', [
    '-c',
    `from PIL import Image
im = Image.open(${JSON.stringify(outPng)}).convert("RGB")
im = im.crop((0, 0, ${W}, ${H}))
im.save(${JSON.stringify(OUT)}, "JPEG", quality=88, optimize=True, progressive=True)
print(f"  {im.size[0]}x{im.size[1]} -> {im.size[0]/im.size[1]:.3f} ratio")`,
  ])

  const bytes = readFileSync(OUT).length
  rmSync(work, { recursive: true, force: true })
  console.log(`og image -> public/assets/og-image.jpg (${(bytes / 1024).toFixed(1)} KB)`)
} catch (err) {
  stop()
  console.error('failed to render og image:', err.message)
  process.exit(1)
}
