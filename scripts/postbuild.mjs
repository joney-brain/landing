/**
 * Runs after `vite build`. Three jobs:
 *
 *   1. Pre-render — inject the SSR markup into the built index.html, so the
 *      first paint and every crawler see real content without running JS.
 *   2. Meta — make Open Graph / Twitter tags absolute and add the dimensions,
 *      using the new 1200x630 card.
 *   3. Emit robots.txt and sitemap.xml for the deployed origin.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { SITE_URL, IS_DEFAULT, site } from '../site.config.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const built = path.join(dist, 'index.html')
const rendered = path.join(root, '.build', 'rendered.html')

if (!existsSync(built)) {
  console.error('dist/index.html not found — run `vite build` first')
  process.exit(1)
}
if (!existsSync(rendered)) {
  console.error('.build/rendered.html not found — run `node scripts/render.mjs` first')
  process.exit(1)
}

let html = readFileSync(built, 'utf8')
const markup = readFileSync(rendered, 'utf8').trim()

// ---------------------------------------------------------------- 1. pre-render
const ROOT_DIV = '<div id="root"></div>'
if (!html.includes(ROOT_DIV)) {
  console.error('could not find <div id="root"></div> in dist/index.html')
  process.exit(1)
}
html = html.replace(ROOT_DIV, `<div id="root">${markup}</div>`)

// ---------------------------------------------------------------- 2. meta
const ogImage = `${SITE_URL}${site.ogImage}`
const tags = [
  `<link rel="canonical" href="${SITE_URL}/" />`,
  `<meta property="og:url" content="${SITE_URL}/" />`,
  `<meta property="og:image" content="${ogImage}" />`,
  `<meta property="og:image:width" content="${site.ogImageWidth}" />`,
  `<meta property="og:image:height" content="${site.ogImageHeight}" />`,
  `<meta property="og:image:alt" content="${site.title}" />`,
  `<meta property="og:site_name" content="${site.name}" />`,
  `<meta name="twitter:card" content="summary_large_image" />`,
  `<meta name="twitter:title" content="${site.title}" />`,
  `<meta name="twitter:description" content="${site.description}" />`,
  `<meta name="twitter:image" content="${ogImage}" />`,
]

// Drop anything the template already declared, then append in one block.
for (const t of tags) {
  const meta = t.match(/(?:property|name)="([^"]+)"/)
  if (meta) {
    html = html.replace(
      new RegExp(`\\s*<meta (?:property|name)="${meta[1]}"[^>]*>`, 'g'),
      '',
    )
  }
  const link = t.match(/rel="([^"]+)"/)
  if (link) {
    html = html.replace(new RegExp(`\\s*<link rel="${link[1]}"[^>]*>`, 'g'), '')
  }
}
html = html.replace('</head>', `    ${tags.join('\n    ')}\n  </head>`)

// ---------------------------------------------------------------- 3. robots + sitemap
const today = new Date().toISOString().slice(0, 10)

writeFileSync(
  path.join(dist, 'robots.txt'),
  [
    '# Евгений Колесников — редактор, контент-стратег, руководитель проектов',
    'User-agent: *',
    'Allow: /',
    '',
    `# The site is one document with in-page anchors; there is nothing to crawl`,
    `# beyond the root and no parameterised URLs to exclude.`,
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n'),
)

writeFileSync(
  path.join(dist, 'sitemap.xml'),
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    '  <url>',
    `    <loc>${SITE_URL}/</loc>`,
    `    <lastmod>${today}</lastmod>`,
    '    <changefreq>monthly</changefreq>',
    '    <priority>1.0</priority>',
    '  </url>',
    '</urlset>',
    '',
  ].join('\n'),
)

writeFileSync(built, html)

// ---------------------------------------------------------------- report
const words = markup
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()

console.log(`pre-render  : injected ${(markup.length / 1024).toFixed(1)} KB into index.html`)
console.log(`              ${words.split(' ').length} words of copy in the initial HTML`)
console.log(`meta        : og:image -> ${ogImage}`)
console.log(`robots.txt  : written`)
console.log(`sitemap.xml : written`)

if (IS_DEFAULT) {
  console.warn(
    '  SITE_URL is not set, so the default origin is used. ' +
      'Set it if the site moves: SITE_URL=https://<domain> npm run build',
  )
}
