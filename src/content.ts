import type { LucideIcon } from 'lucide-react'
import { Compass, Workflow, Target } from 'lucide-react'

/**
 * Single source of truth for every word, figure and link on the page.
 * Copy is verbatim from the brief — only visual hierarchy may change.
 */

export const links = {
  telegram: 'https://t.me/Joney',
  email: 'mailto:zloi_kak@inbox.ru',
  resume:
    'https://ekaterinburg.hh.ru/resume/a6524550ff0164f9f30039ed1f77573350504e',
} as const

export const profile = {
  name: 'Евгений Колесников',
  role: 'Редактор, контент-стратег, руководитель проектов',
  lead: 'Создаю контент для бизнеса: от посадочных страниц и email-рассылок до бренд-медиа и IT-блогов. Упаковываю опыт экспертов в ясный, структурированный текст.',
}

/** One run of text, optionally a link. Splits a sentence without losing wording. */
export type Segment = { text: string; href?: string }

export const credentials: ReadonlyArray<ReadonlyArray<Segment>> = [
  [{ text: 'Больше 15 лет работаю с медиа' }],
  [
    { text: 'Сейчас — главный редактор ' },
    { text: 'техносайта Городских сервисов Яндекса', href: 'https://dev.go.yandex/' },
    { text: ' и редактор ' },
    {
      text: 'блога Magnus Tech',
      href: 'https://habr.com/ru/companies/magnus-tech/articles/',
    },
  ],
]

export const nav = [
  { id: 'services', label: 'Услуги' },
  { id: 'results', label: 'Результаты' },
  { id: 'cases', label: 'Кейсы' },
  { id: 'contact', label: 'Контакты' },
] as const

export const services = [
  {
    title: 'Запуск и перезапуск корпоративных медиа и блогов',
    text: 'Анализ целевой аудитории, разработка стратегии, редполитики, контент-плана и выстраивание регулярного конвейера публикаций под ключ.',
  },
  {
    title: 'Управление редакцией и процессами',
    text: 'Организация работы с внутренними экспертами компании, руководство авторами и корректорами, контроль дедлайнов и стандартов качества.',
  },
  {
    title: 'Экспертные колонки и флагманские статьи',
    text: 'Подготовка глубоких лонгридов, интервью и аналитических материалов для профильных площадок, Хабра или отраслевых изданий.',
  },
  {
    title: 'Дистрибуция контента',
    text: 'Упаковка материалов для продвижения: анонсы для Telegram-каналов, соцсетей, рассылок и таргетированной рекламы с высокой кликабельностью.',
  },
] as const

/** `emphasis` marks fragments that are lifted in the accent colour. */
export type Result = {
  figure: string
  figureAccent?: string
  caption: ReadonlyArray<{ text: string; emphasis?: true }>
}

export const results: ReadonlyArray<Result> = [
  {
    figure: '1,24 млн',
    caption: [
      { text: 'уникальных читателей техносайта за год ' },
      { text: '(+465% год к году)', emphasis: true },
    ],
  },
  {
    figure: 'в 17 раз',
    figureAccent: '(+1645%)',
    caption: [
      { text: 'выросла аудитория блога после перезапуска контент-стратегии' },
    ],
  },
  {
    figure: '~36 000 часов',
    caption: [
      { text: 'провели читатели за изучением материалов на сайте' },
    ],
  },
  {
    figure: '30 глубоких лонгридов',
    caption: [
      {
        text: 'выпущено за год — от сбора первичной фактуры с экспертами до финальной вёрстки',
      },
    ],
  },
  {
    figure: 'до 7,3% CTR',
    caption: [
      { text: 'в рекламных и промо-посевах статей при стоимости клика ' },
      { text: 'от 4 ₽', emphasis: true },
    ],
  },
]

export const strengths: ReadonlyArray<{
  icon: LucideIcon
  title: string
  text: string
}> = [
  {
    icon: Compass,
    title: 'Быстрое погружение в тему',
    text: 'Легко разбираюсь в отраслевой специфике, технической документации и бизнес-моделях. Мне не нужно объяснять базовые вещи — я сразу говорю с экспертами на их языке.',
  },
  {
    icon: Workflow,
    title: 'Редакционное продюсирование',
    text: 'У разработчиков, как правило, нет времени писать тексты. Я выстраиваю процесс так, чтобы за короткое интервью собрать ключевую фактуру, упаковать её в сильный материал и опубликовать от имени автора.',
  },
  {
    icon: Target,
    title: 'Фокус на бизнес-задачах',
    text: 'Не занимаюсь текстами ради текстов. Контент всегда привязан к измеримой цели: рост аудитории, продажи, усиление HR-бренда или повышение узнаваемости.',
  },
]

/** `host` is derived from the published URL — no invented metadata. */
export const cases = [
  {
    kind: 'Технологии / DevRel',
    host: 'dev.go.yandex',
    title:
      'Как добавить вертолёты в приложение такси и не сойти с ума от дедлайнов',
    url: 'https://dev.go.yandex/blog/helicopter-integration-2026-03-18',
    text: 'Собрал сложную фактуру с инженерами и перевёл в прикладной лонгрид. Статья стала одной из самых читаемых в блоге, а авторы, благодаря ей, получили предложение выступить на конференции.',
  },
  {
    kind: 'Сложный технический лонгрид',
    host: 'dev.go.yandex',
    title: 'Пишем собственный рекламный движок для Яндекс Еды за три месяца',
    url: 'https://dev.go.yandex/blog/building-custom-ad-engine-2026-04-21',
    text: 'Провёл серию глубинных интервью с разработчиками, структурировал массив технических подробностей и упаковал это всё в наглядный архитектурный кейс.',
  },
  {
    kind: 'Сторителлинг / Сценарии',
    host: 'dtf.ru',
    title: 'Как я писал сценарий для карты Snowrunner',
    url: 'https://dtf.ru/snowrunner/3106133-kak-ya-pisal-scenarii-dlya-karty-snowrunner',
    text: 'Разработал сценарий и нарратив для карты в Snowrunner. А позже оформил этот опыт в кейс о том, как выстроить логику пользовательского опыта и удержать внимание через текст.',
  },
  {
    kind: 'Редакторское ремесло',
    host: 'vc.ru',
    title:
      'Как писать так, чтобы читатель дочитал до конца: 7 проверенных приёмов удержания внимания',
    url: 'https://vc.ru/marketing/1703305-kak-pisat-tak-chtoby-chitatel-dochital-do-konca-7-proverennyh-priemov-uderzhanija-vnimanija',
    text: 'Систематизировал собственный опыт управления вниманием читателя в медиа и коммерческих проектах: как работать со структурой, ритмом и драматургией текста.',
  },
] as const
