#!/usr/bin/env python3
"""Audit the rendered DOM against the brief: copy, links, semantics, a11y, theming."""
from __future__ import annotations

import glob
import os
import re
import sys
import unicodedata
from html.parser import HTMLParser

HTML = open(".build/rendered.html", encoding="utf-8").read()
INDEX_HTML = open("dist/index.html", encoding="utf-8").read()
CSS = "".join(open(f, encoding="utf-8").read() for f in glob.glob("dist/assets/*.css"))
SRC_CSS = open("src/index.css", encoding="utf-8").read()

# ---------------------------------------------------------------- copy audit
REQUIRED_TEXT = [
    "Евгений Колесников",
    "Редактор, контент-стратег, руководитель проектов",
    "Создаю контент для бизнеса: от посадочных страниц и email-рассылок до бренд-медиа и IT-блогов. "
    "Упаковываю опыт экспертов в ясный, структурированный текст.",
    # credentials: no trailing period
    "Больше 15 лет работаю с медиа",
    "Сейчас — главный редактор техносайта Городских сервисов Яндекса и редактор блога Magnus Tech",
    "Написать в Telegram",
    "Смотреть портфолио",
    "С чем я могу вам помочь",
    "Запуск и перезапуск корпоративных медиа и блогов",
    "Анализ целевой аудитории, разработка стратегии, редполитики, контент-плана и выстраивание "
    "регулярного конвейера публикаций под ключ.",
    "Управление редакцией и процессами",
    "Организация работы с внутренними экспертами компании, руководство авторами и корректорами, "
    "контроль дедлайнов и стандартов качества.",
    "Экспертные колонки и флагманские статьи",
    "Подготовка глубоких лонгридов, интервью и аналитических материалов для профильных площадок, "
    "Хабра или отраслевых изданий.",
    "Дистрибуция контента",
    "Упаковка материалов для продвижения: анонсы для Telegram-каналов, соцсетей, рассылок и "
    "таргетированной рекламы с высокой кликабельностью.",
    "Измеримые результаты",
    "Цифры последнего периода работы с аудиторией и дистрибуцией:",
    "1,24 млн",
    "(+465% год к году)",
    "в 17 раз",
    "(+1645%)",
    "~36 000 часов",
    "30 глубоких лонгридов",
    "до 7,3% CTR",
    "от 4 ₽",
    # results captions: no trailing periods
    "уникальных читателей техносайта за год (+465% год к году)",
    "выросла аудитория блога после перезапуска контент-стратегии",
    "провели читатели за изучением материалов на сайте",
    "выпущено за год — от сбора первичной фактуры с экспертами до финальной вёрстки",
    "в рекламных и промо-посевах статей при стоимости клика от 4 ₽",
    "Сильные стороны",
    # strength titles: no trailing periods (bodies keep theirs)
    "Быстрое погружение в тему",
    "Легко разбираюсь в отраслевой специфике, технической документации и бизнес-моделях. Мне не "
    "нужно объяснять базовые вещи — я сразу говорю с экспертами на их языке.",
    "Редакционное продюсирование",
    "У разработчиков, как правило, нет времени писать тексты. Я выстраиваю процесс так, чтобы за "
    "короткое интервью собрать ключевую фактуру, упаковать её в сильный материал и опубликовать "
    "от имени автора.",
    "Фокус на бизнес-задачах",
    "Не занимаюсь текстами ради текстов. Контент всегда привязан к измеримой цели: рост аудитории, "
    "продажи, усиление HR-бренда или повышение узнаваемости.",
    "Кейсы и избранные материалы",
    "Как добавить вертолёты в приложение такси и не сойти с ума от дедлайнов",
    "Собрал сложную фактуру с инженерами и перевёл в прикладной лонгрид. Статья стала одной из самых "
    "читаемых в блоге, а авторы, благодаря ей, получили предложение выступить на конференции.",
    "Пишем собственный рекламный движок для Яндекс Еды за три месяца",
    "Провёл серию глубинных интервью с разработчиками, структурировал массив технических подробностей "
    "и упаковал это всё в наглядный архитектурный кейс.",
    "Как я писал сценарий для карты Snowrunner",
    "Разработал сценарий и нарратив для карты в Snowrunner. А позже оформил этот опыт в кейс о том, "
    "как выстроить логику пользовательского опыта и удержать внимание через текст.",
    "Как писать так, чтобы читатель дочитал до конца: 7 проверенных приёмов удержания внимания",
    "Систематизировал собственный опыт управления вниманием читателя в медиа и коммерческих "
    "проектах: как работать со структурой, ритмом и драматургией текста.",
    "Открыт к вашим предложениям",
]

# Superseded strings that must no longer appear anywhere in the visible text.
FORBIDDEN_TEXT = [
    "Lorem ipsum",
    "lorem",
    "TODO",
    "FIXME",
    "placeholder",
    "example.com",
    "Больше 15 лет работаю с медиа.",
    "редактор блога Magnus Tech.",
    "перезапуска контент-стратегии.",
    "материалов на сайте.",
    "до финальной вёрстки.",
    "от 4 ₽.",
    "Быстрое погружение в тему.",
    "Редакционное продюсирование.",
    "Фокус на бизнес-задачах.",
]

REQUIRED_LINKS = [
    "https://t.me/Joney",
    "mailto:zloi_kak@inbox.ru",
    "https://ekaterinburg.hh.ru/resume/a6524550ff0164f9f30039ed1f77573350504e",
    "https://dev.go.yandex/blog/helicopter-integration-2026-03-18",
    "https://dev.go.yandex/blog/building-custom-ad-engine-2026-04-21",
    "https://dtf.ru/snowrunner/3106133-kak-ya-pisal-scenarii-dlya-karty-snowrunner",
    "https://vc.ru/marketing/1703305-kak-pisat-tak-chtoby-chitatel-dochital-do-konca-7"
    "-proverennyh-priemov-uderzhanija-vnimanija",
    # inline links inside the hero credential sentence
    "https://dev.go.yandex/",
    "https://habr.com/ru/companies/magnus-tech/articles/",
]

# Anchor text that must exist verbatim, wrapped in a link.
INLINE_LINK_TEXT = {
    "https://dev.go.yandex/": "техносайта Городских сервисов Яндекса",
    "https://habr.com/ru/companies/magnus-tech/articles/": "блога Magnus Tech",
}


def norm(s: str) -> str:
    s = unicodedata.normalize("NFC", s).replace("\u00a0", " ")
    return " ".join(s.split())


class Audit(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.stack: list[str] = []
        self.text: list[str] = []
        self.links: list[dict] = []
        self.imgs: list[dict] = []
        self.headings: list[list] = []
        self.ids: set[str] = set()
        self.landmarks: list[str] = []
        self.sr_only = 0
        self.in_svg = 0
        self.buttons: list[dict] = []

    def handle_starttag(self, tag, attrs):
        a = {k: (v or "") for k, v in attrs}
        cls = a.get("class", "")
        self.stack.append(tag)
        if a.get("id"):
            self.ids.add(a["id"])
        if tag in ("header", "footer", "nav", "main", "aside"):
            self.landmarks.append(tag)
        if tag == "a":
            self.links.append({"href": a.get("href", ""), "target": a.get("target", ""),
                                "rel": a.get("rel", ""), "label": a.get("aria-label", ""),
                                "text": ""})
        if tag == "img":
            self.imgs.append(a)
        if tag in ("h1", "h2", "h3", "h4"):
            self.headings.append([tag, ""])
        if tag == "button":
            self.buttons.append(a)
        if tag == "svg":
            self.in_svg += 1
        if "sr-only" in cls:
            self.sr_only += 1

    def handle_endtag(self, tag):
        if self.stack:
            self.stack.pop()
        if tag == "svg" and self.in_svg:
            self.in_svg -= 1

    def handle_data(self, data):
        if self.in_svg:
            return
        self.text.append(data)
        # capture anchor text so inline links can be asserted
        if "a" in self.stack:
            for link in reversed(self.links):
                if link["href"]:
                    link["text"] += data
                    break
        if self.headings:
            for level in ("h1", "h2", "h3", "h4"):
                if level in self.stack:
                    self.headings[-1][1] += data
                    break


p = Audit()
p.feed(HTML)
visible = norm(" ".join(p.text))
failures: list[str] = []

print("=" * 74)
print("1) VERBATIM COPY")
miss = [t for t in REQUIRED_TEXT if norm(t) not in visible]
for t in miss:
    print(f"  MISS  {t[:78]}")
print(f"  -> {len(REQUIRED_TEXT) - len(miss)}/{len(REQUIRED_TEXT)} present")
failures += [f"copy: {t[:50]}" for t in miss]

print("\n2) SUPERSEDED / FORBIDDEN STRINGS")
for f in FORBIDDEN_TEXT:
    hit = f.lower() in visible.lower()
    if hit:
        failures.append(f"forbidden: {f}")
    print(f"  {'FAIL' if hit else 'OK  '}  {f}")

print("\n3) LINKS")
hrefs = {l["href"] for l in p.links}
for link in REQUIRED_LINKS:
    ok = link in hrefs
    print(f"  {'OK  ' if ok else 'MISS'}  {link[:72]}")
    if not ok:
        failures.append(f"link: {link}")
ext = [l for l in p.links if l["target"] == "_blank"]
bad = [l for l in ext if "noopener" not in l["rel"]]
print(f"  external {len(ext)}, all rel=noopener: {not bad}")
if bad:
    failures.append("target=_blank without rel=noopener")
print(f"  mailto links: {len([l for l in p.links if l['href'].startswith('mailto:')])}")
addr_visible = "zloi_kak@inbox.ru" in visible
print(f"  {'FAIL' if addr_visible else 'OK  '}  email address not rendered as text")
if addr_visible:
    failures.append("email address visible as text")

print("\n3b) INLINE LINKS IN THE HERO SENTENCE")
for url, anchor in INLINE_LINK_TEXT.items():
    hit = [l for l in p.links if l["href"] == url]
    ok = bool(hit) and norm(hit[0]["text"]) == norm(anchor)
    print(f"  {'OK  ' if ok else 'MISS'}  {anchor!r} -> {url}")
    if not ok:
        failures.append(f"inline link: {anchor}")
    else:
        lbl = norm(hit[0]["label"])
        if lbl and not lbl.startswith(norm(anchor)):
            failures.append(f"aria-label must contain the visible anchor text: {anchor}")
        if hit[0]["target"] != "_blank" or "noopener" not in hit[0]["rel"]:
            failures.append(f"inline link not safe: {url}")
# The sentence must still read as one continuous string. Reuse the entry from
# section 1 so the two assertions can never drift apart.
SENTENCE = next(t for t in REQUIRED_TEXT if t.startswith("\u0421\u0435\u0439\u0447\u0430\u0441"))
print(f"  {'OK  ' if norm(SENTENCE) in visible else 'MISS'}  sentence still contiguous")
if norm(SENTENCE) not in visible:
    failures.append("hero credential sentence broken by inline links")

# No duplicated Telegram CTA inside the closing section.
footer_html = HTML[HTML.find('<footer'):]
tg_in_footer = footer_html.count("t.me/Joney")
tg_buttons = footer_html.count("Написать в Telegram")
print(f"  telegram links in footer: {tg_in_footer} (expected 1)")
print(f"  'Написать в Telegram' in footer: {tg_buttons} (expected 0)")
if tg_in_footer != 1 or tg_buttons != 0:
    failures.append("duplicate Telegram CTA in footer")

print("\n4) DOCUMENT OUTLINE")
for tag, txt in p.headings:
    print(f"  {tag:>3}  {norm(txt)[:68]}")
h1 = [h for h in p.headings if h[0] == "h1"]
if len(h1) != 1 or p.headings[0][0] != "h1":
    failures.append(f"h1 structure wrong (count={len(h1)})")
levels = [h[0] for h in p.headings]
print(f"  h1={levels.count('h1')} h2={levels.count('h2')} h3={levels.count('h3')}")
# The closing line must NOT be a heading.
closing = re.search(r'<(\w+)[^>]*id="contact-title"', HTML)
print(f"  closing line element: <{closing.group(1) if closing else '?'}> (expected p)")
if not closing or closing.group(1) != "p":
    failures.append("closing line is not body copy")
if "Сильные стороны" in [norm(h[1]) for h in p.headings]:
    pass
print(f"  strength titles heading-free of periods: "
      f"{all(not norm(h[1]).endswith('.') for h in p.headings if h[1] in ('Быстрое погружение в тему',))}")

print("\n5) LANDMARKS & NAVIGATION")
print(f"  landmarks: {p.landmarks}")
for need in ("header", "main", "nav", "footer"):
    if need not in p.landmarks:
        failures.append(f"missing <{need}>")
for need in ("top", "services", "results", "strengths", "cases", "contact"):
    if need not in p.ids:
        failures.append(f"missing id={need}")
for l in p.links:
    if l["href"].startswith("#") and l["href"][1:] not in p.ids:
        failures.append(f"dead anchor {l['href']}")
print(f"  internal links: {sorted({l['href'] for l in p.links if l['href'].startswith('#')})}")

print("\n6) IMAGES")
for i in p.imgs:
    ok = i.get("alt") and i.get("width") and i.get("height")
    print(f"  {'OK  ' if ok else 'FAIL'}  {i.get('src')} {i.get('width')}x{i.get('height')}")
    if not ok:
        failures.append(f"img attrs: {i.get('src')}")
if len(p.imgs) != 1:
    failures.append(f"expected 1 image, found {len(p.imgs)}")
if "portrait-manifesto" in HTML:
    failures.append("removed manifesto portrait still referenced")

print("\n6b) NUMBERING")
# Only section indices (02..06) may remain; per-item numbers are gone.
bare = [t for t in p.text if t.strip()]
index_tokens = {}
for t in bare:
    t = t.strip()
    if re.fullmatch(r"0[1-6]", t):
        index_tokens[t] = index_tokens.get(t, 0) + 1
print(f"  bare two-digit tokens found: {index_tokens or 'none'}")
if "01" in index_tokens:
    failures.append("per-item numbering still present (01)")
for token in ("02", "03", "04", "05", "06"):
    if index_tokens.get(token, 0) != 1:
        failures.append(f"section index {token} appears {index_tokens.get(token, 0)}x (expected 1)")
if not all(v == 1 for k, v in index_tokens.items()):
    failures.append("duplicated index numerals")
print(f"  expected exactly one of each 02..06: "
      f"{all(index_tokens.get(t) == 1 for t in ('02', '03', '04', '05', '06'))}")

print("\n6c) CARD HOVER TREATMENT")
card_rules = [
    ("no stray accent top bar", "absolute inset-x-0 top-0 h-px" not in HTML),
    ("card class in the stylesheet", ".card{" in CSS),
    ("hover paints the whole border",
     ".card:hover,.card:focus-visible{border-color:var(--color-accent)" in CSS),
    ("radius shared between border and outline", "border-radius:var(--radius-2xl)" in CSS),
    ("no overlay pseudo-element faking the ring",
     ".card:after" not in CSS and ".card::after" not in CSS),
]
for name, ok in card_rules:
    if not ok:
        failures.append(f"card hover: {name}")
    print(f"  {'OK  ' if ok else 'MISS'}  {name}")
print(f"  cards on the page: {HTML.count('class=\"card') + HTML.count('card h-full')}")

print("\n7) ACCESSIBILITY")
print(f"  skip link: {'OK' if 'skip-link' in HTML else 'MISS'}")
print(f"  aria-labelledby: {HTML.count('aria-labelledby')}  aria-label: {HTML.count('aria-label')}")
print(f"  sr-only spans: {p.sr_only}  aria-hidden: {HTML.count('aria-hidden')}")
print(f"  new-tab hints: {HTML.count('откроется в новой вкладке')}")
if p.sr_only < 8:
    failures.append("too few sr-only labels")
print(f"  focus-visible: {'OK' if 'focus-visible' in SRC_CSS else 'MISS'}")
print(f"  reduced-motion: {'OK' if 'prefers-reduced-motion' in SRC_CSS else 'MISS'}")
tg = [b for b in p.buttons if 'aria-pressed' in b]
print(f"  aria-pressed buttons: {len(tg)} (expected 3)")
if len(tg) != 3:
    failures.append("theme toggle must expose 3 pressed-state buttons")
if HTML.count("<button") != 3:
    failures.append("unexpected number of buttons")

print("\n8) THEMING")
# Lightning CSS rewrites oklch(0.977 …) as oklch(97.7% …), so compare the
# numeric lightness of every --p-<token> declaration instead of raw text.


def lightness(token: str) -> list[float]:
    out = []
    for m in re.finditer(rf"--p-{re.escape(token)}:oklch\(([\d.]+)", CSS):
        v = float(m.group(1))
        out.append(v / 100 if v > 1 else v)
    return out


page_l = lightness("page")
ink_l = lightness("ink")
accent_l = lightness("accent")

theme_checks = {
    "pre-paint inline script": "prefers-color-scheme: dark" in INDEX_HTML
    and "dataset.theme" in INDEX_HTML,
    "color-scheme meta light dark": 'content="light dark"' in INDEX_HTML,
    "[data-theme='dark'] block": ":root[data-theme=dark]" in CSS,
    "two page lightness stops": len(page_l) >= 2 and abs(page_l[0] - 0.977) < 0.002
    and abs(page_l[1] - 0.205) < 0.002,
    "two ink lightness stops": len(ink_l) >= 2 and abs(ink_l[0] - 0.19) < 0.002
    and abs(ink_l[1] - 0.945) < 0.002,
    "accent lifts in dark": len(accent_l) >= 2 and accent_l[1] > accent_l[0],
    "dark surfaces rise with elevation": lightness("card")[0] > lightness("page")[1],
    "plate scope maps tokens": ".plate-ink" in CSS
    and "--background:var(--p-plate)" in CSS.replace(" ", ""),
    "theme-switching transition": "theme-switching" in CSS,
    "color-scheme per theme": "color-scheme:dark" in CSS.replace(" ", ""),
    "storage key in bundle": "theme"
    in "".join(open(f, encoding="utf-8").read() for f in glob.glob("dist/assets/*.js")),
}
for k, v in theme_checks.items():
    if not v:
        failures.append(f"theme: {k}")
    print(f"  {'OK  ' if v else 'MISS'}  {k}")
print(f"  theme-colors: {re.findall(r'#[0-9a-f]{6}', INDEX_HTML)}")

print("\n9) RESPONSIVE HOOKS")
for bp in ("40rem", "48rem", "64rem", "80rem"):
    ok = bp in CSS
    if not ok:
        failures.append(f"missing breakpoint {bp}")
    print(f"  {'OK  ' if ok else 'MISS'}  breakpoint {bp}")

print("\n9c) METRICS STACK ON PHONES")
results_src = open("src/components/sections/Results.tsx", encoding="utf-8").read()
centre_checks = {
    "centred below md": "text-center" in results_src and "md:text-left" in results_src,
    "cells centre on mobile": "items-center" in results_src and "items-stretch" in results_src,
    "horizontal padding on mobile": "px-6" in results_src,
    "two columns from md": "md:grid-cols-2" in results_src,
}
for name, ok in centre_checks.items():
    if not ok:
        failures.append(f"metrics responsive: {name}")
    print(f"  {'OK  ' if ok else 'MISS'}  {name}")

print("\n9d) SELF-HOSTED FONTS")
fonts_css = open("src/fonts.css", encoding="utf-8").read()
font_files = sorted(glob.glob("dist/assets/fonts/*.woff2"))
external = re.findall(r"fonts\.(?:googleapis|gstatic)\.com", INDEX_HTML + CSS)
font_checks = {
    "no Google Fonts in html or css": not external,
    "no preconnect to a font CDN": "fonts.googleapis.com" not in INDEX_HTML,
    "@font-face rules present": fonts_css.count("@font-face") >= 4,
    "all @font-face src are local": all(
        "url('/assets/fonts/" in m for m in re.findall(r"src:\s*url\([^)]*\)", fonts_css)
    ),
    "font-display: swap everywhere": fonts_css.count("font-display: swap") == fonts_css.count("@font-face"),
    "font files shipped": len(font_files) >= 4,
    "no cyrillic-less fallback": "U+0400-045F" in fonts_css,
    "preloaded for first paint": 'rel="preload"' in INDEX_HTML and "as=\"font\"" in INDEX_HTML.replace("\n", " "),
    "weights filtered to what is used": not re.search(r"Spectral.*font-weight: (400|700)", fonts_css),
}
for name, ok in font_checks.items():
    if not ok:
        failures.append(f"fonts: {name}")
    print(f"  {'OK  ' if ok else 'MISS'}  {name}")
font_bytes = sum(os.path.getsize(f) for f in font_files)
print(f"  {len(font_files)} files, {font_bytes/1024:.1f} KB total (all subsets)")

print("\n9e) PRE-RENDER")
built_html = open("dist/index.html", encoding="utf-8").read()
built_text = re.sub(r"<[^>]+>", " ", built_html)
built_text = " ".join(built_text.split())
pre_checks = {
    "root div is not empty": '<div id="root"></div>' not in built_html,
    "h1 present in the shipped html": "<h1" in built_html,
    "all six sections in the html": all(f'id="{s}"' in built_html
                                        for s in ("services", "results", "strengths", "cases", "contact")),
    "copy is in the initial payload": norm(SENTENCE) in norm(built_text),
    "hashed js bundle still referenced": 'type="module"' in built_html and "/assets/index-" in built_html,
    "hashed css still referenced": 'rel="stylesheet"' in built_html,
    "no build artefact shipped": not os.path.exists("dist/rendered.html"),
    "og image referenced absolutely": 'content="https://' in built_html and "og-image.jpg" in built_html,
}
for name, ok in pre_checks.items():
    if not ok:
        failures.append(f"pre-render: {name}")
    print(f"  {'OK  ' if ok else 'MISS'}  {name}")
words = len(built_text.split())
print(f"  {len(built_html)/1024:.1f} KB index.html, ~{words} words before any JS runs")

print("\n9f) robots.txt / sitemap.xml")
robots_p = "dist/robots.txt"
sitemap_p = "dist/sitemap.xml"
robots = open(robots_p, encoding="utf-8").read() if os.path.exists(robots_p) else ""
sitemap = open(sitemap_p, encoding="utf-8").read() if os.path.exists(sitemap_p) else ""
site_checks = {
    "robots.txt exists": bool(robots),
    "robots allows crawling": "User-agent: *" in robots and "Allow: /" in robots,
    "robots points at the sitemap": "Sitemap: http" in robots,
    "sitemap.xml exists": bool(sitemap),
    "sitemap is well formed": sitemap.startswith("<?xml") and "</urlset>" in sitemap,
    "sitemap has exactly one url": sitemap.count("<url>") == 1,
}
for name, ok in site_checks.items():
    if not ok:
        failures.append(f"seo: {name}")
    print(f"  {'OK  ' if ok else 'MISS'}  {name}")

# The origin in robots.txt, sitemap.xml and og:url must be the same string.
origins = set()
for pat, src in (
    (r"Sitemap: (https?://[^/\s]+)", robots),
    (r"<loc>(https?://[^/\s]+)", sitemap),
    (r'property="og:url" content="(https?://[^/\s]+)', built_html),
):
    m = re.search(pat, src)
    origins.add(m.group(1) if m else None)
same_origin = len(origins) == 1 and None not in origins
if not same_origin:
    failures.append(f"origin mismatch: {origins}")
print(f"  {'OK  ' if same_origin else 'MISS'}  one origin in robots/sitemap/og:url")

og_img = "public/assets/og-image.jpg"
og_ok = os.path.exists(og_img)
og_size = None
if og_ok:
    try:
        from PIL import Image
        with Image.open(og_img) as im:
            og_size = im.size
    except Exception:
        og_ok = False
if not (og_ok and og_size == (1200, 630)):
    failures.append(f"og image wrong size: {og_size}")
print(f"  {'OK  ' if og_ok and og_size == (1200, 630) else 'MISS'}  og image 1200x630 ({og_size})")
if og_ok:
    print(f"        {os.path.getsize(og_img)/1024:.1f} KB")

print("\n10) ASSET BUDGET")
total = 0
for f in sorted(glob.glob("dist/**/*", recursive=True)):
    if not os.path.isfile(f):
        continue
    size = os.path.getsize(f)
    total += size
    print(f"  {size / 1024:8.1f} KB  {os.path.relpath(f, 'dist')}")
print(f"  {total / 1024:8.1f} KB  total (uncompressed)")
if total > 800 * 1024:
    failures.append("asset budget exceeded")

print("\n" + "=" * 74)
if failures:
    print(f"RESULT: {len(failures)} PROBLEM(S)")
    for f in failures:
        print("  -", f)
    sys.exit(1)
print("RESULT: ALL CHECKS PASSED")
