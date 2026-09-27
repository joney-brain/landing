# Евгений Колесников — редактор, контент-стратег, руководитель проектов

Одностраничный лендинг-портфолио. React 19 + Vite + Tailwind CSS v4 + `lucide-react`.
Светлая и тёмная темы, переключение: светлая / тёмная / как в системе.
Статика: 4 файла, без Node и базы на сервере. Pre-render, свои шрифты, SEO-файлы.

## Запуск

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc + vite build + pre-render + robots/sitemap
npm run preview    # проверить продакшен-сборку
npm run verify     # build + аудит копипаста/ссылок/a11y/тем/шрифтов/pre-render
```

### Перед публикацией задайте домен

```bash
SITE_URL=https://ваш-домен.ru npm run build
```

Домен попадёт в `og:url`, `robots.txt` и `sitemap.xml`. Без этой переменной
сборка предупредит, что в этих трёх местах остался `https://example.com`.

### Вспомогательные команды

```bash
npm run fonts   # заново выкачать и отфильтровать шрифты (scripts/fetch-fonts.py)
npm run og      # перерендерить превью-картинку 1200x630 (scripts/make-og.mjs)
```

Это не ежедневные операции, а шаги при изменении дизайна, текста или фотографии.
Обычная сборка их не трогает: `og-image.jpg` и `.woff2` лежат в репозитории.

## Пайплайн сборки

```
tsc -b                 проверка типов
vite build             бандл + хешированные имена ассетов
scripts/render.mjs     react-dom/server -> .build/rendered.html
                       (+ рендер дважды и побайтовое сравнение: если разошлось,
                        гидратация выбросила бы серверный HTML)
scripts/postbuild.mjs  1) вставляет пререндер в dist/index.html
                       2) абсолютные og:/twitter:-теги с размерами картинки
                       3) пишет dist/robots.txt и dist/sitemap.xml
```

## Структура

```
src/
  content.ts                     ← единственный источник текста, цифр и ссылок
  index.css                      ← палитра (светлая/тёмная), семантические токены, motion
  fonts.css                      ← ГЕНЕРИРУЕТСЯ: @font-face на локальные .woff2
  App.tsx                        ← сборка секций
  hooks/
    useTheme.ts                  ← 3 состояния темы, localStorage, слежка за ОС
  components/
    primitives/
      Reveal.tsx                 ← useInView + Reveal + Rule
      SectionHeading.tsx         ← индекс / линейка / заголовок / подзаголовок
      ButtonLink.tsx             ← primary | outline
      Masthead.tsx               ← липкая навигация
      ThemeToggle.tsx            ← ☀ / ☾ / монитор, aria-pressed на каждом сегменте
    sections/
      Hero.tsx                   ← экран 1
      Services.tsx               ← экран 2
      Results.tsx                ← экран 3
      Strengths.tsx              ← экран 4 (манифест, без фото)
      Cases.tsx                  ← экран 5
      Contact.tsx                ← экран 6 (ink-плита, обычный текст + иконки)
public/assets/
  portrait-hero.webp             ← кроп portrait-2.png, 4:5, 64 КБ
  og-image.jpg                   ← превью 1200x630, 73 КБ
  fonts/*.woff2                  ← 7 файлов, 154 КБ, локальные
og/og.html                       ← исходник превью-картинки (в сборку не попадает)
site.config.mjs                  ← SITE_URL + метаданные для og/robots/sitemap
scripts/
  render.mjs                     ← SSR-рендер
  postbuild.mjs                  ← pre-render + мета + robots + sitemap
  make-og.mjs                    ← рендер og-image.jpg через headless Firefox
  fetch-fonts.py                 ← скачивание + фильтрация шрифтов
  entry-server.tsx               ← SSR-точка входа
  audit.py                       ← аудит всего собранного
```

## Шрифты

`npm run fonts` отдаёт Google Fonts API, пересекает `unicode-range` каждого
`@font-face` с реально встречающимися на странице символами и оставляет только
нужные сабсеты. Затем фильтрует по весам: Spectral отдаётся отдельными
статическими файлами на каждый вес, а дизайн просит у него только 500 и 600.

Сейчас в комплекте 7 файлов / 154 КБ вместо 581 КБ во всех сабсетах. Проверено:
`cyrillic` (весь текст), `latin` (Telegram, Email, CTR, имена), `latin-ext`
(единственный символ — `₽`).

**Важно:** не правьте `src/fonts.css` руками — он перезаписывается. Правьте
`scripts/fetch-fonts.py` и перегенерируйте.

## Правила

- **Текст не редактируется.** Любая правка формулировки, цифры или ссылки — только в
  `src/content.ts`. `npm run verify` падает, если хоть одна из обязательных строк или
  7 обязательных ссылок исчезла из отрендеренного DOM **или** если вернулась
  «снятая» версия строки.
- **Цвет — только через токены.** Hex в компонентах запрещён; ink-плита переопределяет
  те же токены через класс `.plate-ink`.
- **Никаких внешних доменов в критическом пути.** Шрифты свои, аналитики нет.
  Проверяется аудитом: ни одного упоминания `fonts.googleapis` / `fonts.gstatic`.
- **Motion — вторичен.** Анимация живёт в CSS, компонент передаёт только задержку.
  Всё уважает `prefers-reduced-motion`. Смена темы кросс-фейдится только пока
  на `:root` висит класс `.theme-switching`.
- **Контраст.** Все текстовые пары проходят WCAG AA в обеих темах (минимум 4.65:1).
  Проверено расчётом в OKLCH.

Подробное описание визуального направления — в `.better-web-ui.md`.
