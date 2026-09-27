/**
 * Single source of truth for the deployed origin.
 *
 * Defaults to the registered domain; override at build time if hosting moves:
 *   SITE_URL=https://example.org npm run build
 *
 * Everything that must agree on the origin — robots.txt, sitemap.xml, the
 * canonical link and the og:/twitter: tags — is generated from here in
 * scripts/postbuild.mjs.
 */
/**
 * Deploy base path, consumed by both vite.config.ts (the client build) and
 * scripts/render.mjs (the pre-render SSR build). They must agree: if the two
 * builds disagree about `base`, the pre-rendered markup ships asset URLs that
 * the client build would not have produced, and the page 404s its own images
 * under a subpath.
 *
 * "./" is relative, so references resolve against the document and work at a
 * domain root as well as under a Pages subpath such as /repo/.
 */
export const BASE_PATH = process.env.BASE_PATH || './'

const DEFAULT = 'https://evgeniykolesnikov.ru'

export const SITE_URL = (process.env.SITE_URL || DEFAULT).replace(/\/+$/, '')

export const IS_DEFAULT = SITE_URL === DEFAULT

export const site = {
  /** Registered domain. Shipped as public/CNAME for GitHub Pages. */
  hostname: 'evgeniykolesnikov.ru',
  name: 'Евгений Колесников',
  title: 'Евгений Колесников — редактор, контент-стратег, руководитель проектов',
  description:
    'Создаю контент для бизнеса: от посадочных страниц и email-рассылок до бренд-медиа и IT-блогов. Упаковываю опыт экспертов в ясный, структурированный текст.',
  locale: 'ru_RU',
  ogImage: '/assets/og-image.jpg',
  ogImageWidth: 1200,
  ogImageHeight: 630,
}
