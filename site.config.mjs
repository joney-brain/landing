/**
 * Single source of truth for the deployed origin.
 *
 * Set SITE_URL at build time:
 *   SITE_URL=https://kolesnikov.ru npm run build
 *
 * Until a domain is chosen the build still succeeds, but postbuild.mjs prints a
 * loud warning: robots.txt, sitemap.xml and the og:url meta will point at the
 * placeholder and must be rebuilt once the real domain is known.
 */
const PLACEHOLDER = 'https://example.com'

export const SITE_URL = (process.env.SITE_URL || PLACEHOLDER).replace(/\/+$/, '')

export const IS_PLACEHOLDER = SITE_URL === PLACEHOLDER

export const site = {
  name: 'Евгений Колесников',
  title: 'Евгений Колесников — редактор, контент-стратег, руководитель проектов',
  description:
    'Создаю контент для бизнеса: от посадочных страниц и email-рассылок до бренд-медиа и IT-блогов. Упаковываю опыт экспертов в ясный, структурированный текст.',
  locale: 'ru_RU',
  ogImage: '/assets/og-image.jpg',
  ogImageWidth: 1200,
  ogImageHeight: 630,
}
