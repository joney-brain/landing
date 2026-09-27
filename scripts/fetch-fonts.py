#!/usr/bin/env python3
"""
Self-host the webfonts.

Two filters keep the payload honest:

  1. Glyphs.  The @font-face unicode-ranges are intersected with the
     characters that can actually reach the screen. Source files are stripped
     of comments first — otherwise an arrow in a JSX comment drags in the
     whole `math` subset for glyphs nobody sees.
  2. Weights. Spectral is served as separate static files per weight, and the
     design only ever asks it for 500 and 600. Shipping 400/700/italics would
     be ~5 files per subset of dead weight.

Onest is a variable font (200..800 in one file), so it needs no weight filter.

Nothing is fetched from Google at runtime afterwards.
"""
from __future__ import annotations

import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "assets" / "fonts"
CSS_OUT = ROOT / "src" / "fonts.css"

UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/126.0.0.0 Safari/537.36")

GF = ("https://fonts.googleapis.com/css2?"
      "family=Onest:wght@200..800"
      "&family=Spectral:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600"
      "&display=swap")

# Which weights each family is allowed to ship.
# Derived from src/index.css (`h1,h2,h3` 600, `.display-name` 600,
# `.figure` 600, `.section-title` 500) and every `font-display` element in the
# components, which is uniformly `font-semibold`. Nothing asks for italics.
ALLOWED: dict[str, dict[str, set[str]]] = {
    "Onest": {"normal": {"200 800"}},                       # variable: one file
    "Spectral": {"normal": {"500", "600"}},
}

# The only character that lives in the latin-ext range is U+20BD (₽), and it
# appears in body copy — never in a Spectral heading. Shipping latin-ext for
# the display face would cost ~20 KB to render a single body-text glyph.
SKIP_SUBSET: dict[str, set[str]] = {"Spectral": {"latin-ext"}}

# Safety net: if a future edit drops a weight that is genuinely used, this
# still ships rather than silently rendering with a synthesised bold.
EXTRA_ALWAYS = {("Spectral", "normal", "500"), ("Spectral", "normal", "600")}


def page_characters() -> set[str]:
    """Characters that can actually reach the screen."""
    chars: set[str] = set()
    sources = [ROOT / "index.html", ROOT / "src" / "content.ts",
               ROOT / "og" / "og.html"]
    sources += [p for p in (ROOT / "src").rglob("*.tsx") if p.name != "content.ts"]

    for path in sources:
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        text = re.sub(r"/\*.*?\*/", " ", text, flags=re.S)
        text = re.sub(r"^\s*//.*$", " ", text, flags=re.M)
        text = re.sub(r"//[^\n]*$", " ", text, flags=re.M)
        for ch in text:
            cp = ord(ch)
            if (cp < 0x20 and ch != " ") or 0x7F <= cp <= 0x9F:
                continue
            chars.add(ch)
    return chars


def parse_ranges(spec: str) -> list[tuple[int, int]]:
    out = []
    for part in spec.split(","):
        part = part.strip().lstrip("U+").lower()
        if "?" in part:
            lo, hi = part.split("?")
            lo_i = int(lo.rstrip("0") or "0", 16)
            hi_i = lo_i + (16 ** (len(lo) - len(lo.rstrip("0")))) - 1
        elif "-" in part:
            a, b = part.split("-")
            lo_i, hi_i = int(a, 16), int(b, 16)
        else:
            lo_i = hi_i = int(part, 16)
        out.append((lo_i, hi_i))
    return out


def main() -> int:
    req = urllib.request.Request(GF, headers={"User-Agent": UA})
    css = urllib.request.urlopen(req, timeout=60).read().decode("utf-8")
    blocks = re.findall(r"/\*\s*([a-z-]+)\s*\*/\s*@font-face\s*\{(.*?)\}", css, re.S)
    if not blocks:
        print("could not parse Google Fonts css", file=sys.stderr)
        return 1

    wanted = page_characters()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for f in OUT_DIR.glob("*.woff2"):
        f.unlink()

    total = 0
    rules: list[str] = []
    kept: list[tuple[str, str]] = []
    cache: dict[str, tuple[str, int]] = {}

    for subset, body in blocks:
        fam = re.search(r"font-family:\s*'([^']+)'", body).group(1)
        style = re.search(r"font-style:\s*([^;]+);", body)
        style = style.group(1).strip() if style else "normal"
        weight = re.search(r"font-weight:\s*([^;]+);", body)
        weight = weight.group(1).strip() if weight else "400"
        rng_m = re.search(r"unicode-range:\s*([^;]+);", body)
        url_m = re.search(r"url\((https://[^)]+\.woff2)\)", body)
        if not rng_m or not url_m:
            continue

        if subset in SKIP_SUBSET.get(fam, set()):
            continue
        if weight not in ALLOWED.get(fam, {}).get(style, set()) \
           and (fam, style, weight) not in EXTRA_ALWAYS:
            continue

        ranges = parse_ranges(rng_m.group(1))
        if not any(any(lo <= ord(ch) <= hi for lo, hi in ranges) for ch in wanted):
            continue

        url = url_m.group(1)
        if url not in cache:
            r = urllib.request.Request(url, headers={"User-Agent": UA})
            data = urllib.request.urlopen(r, timeout=60).read()
            slug = f"{fam.lower()}-{subset}"
            if " " in weight:
                slug += f"-{weight.replace(' ', '-')}"
            elif weight not in ("400", "variable"):
                slug += f"-{weight}"
            if style != "normal":
                slug += f"-{style}"
            dest = OUT_DIR / f"{slug}.woff2"
            dest.write_bytes(data)
            cache[url] = (dest.name, len(data))
        name, size = cache[url]
        total += size
        kept.append((name, size))

        rules.append(
            "@font-face {\n"
            f"  font-family: '{fam}';\n"
            f"  font-style: {style};\n"
            f"  font-weight: {weight};\n"
            "  font-display: swap;\n"
            f"  src: url('/assets/fonts/{name}') format('woff2');\n"
            f"  unicode-range: {rng_m.group(1).strip()};\n"
            "}\n"
        )

    CSS_OUT.write_text(
        "/* ------------------------------------------------------------------ *\n"
        " *  Self-hosted webfonts — GENERATED, do not edit by hand.\n"
        f" *  Spectral + Onest via Google Fonts, {total/1024:.0f} KB after\n"
        " *  glyph- and weight-subsetting. Nothing is requested from Google at\n"
        " *  runtime: no third-party domain in the critical path, no extra DNS\n"
        " *  round trip, and the files are served from our own host.\n"
        " *\n"
        " *  Regenerate with:  python3 scripts/fetch-fonts.py\n"
        " * ------------------------------------------------------------------ */\n\n"
        + "\n".join(rules),
        encoding="utf-8",
    )

    print(f"@font-face rules : {len(rules)}")
    print(f"files written    : {len(cache)}")
    for name, size in sorted(kept, key=lambda r: r[0]):
        print(f"   {name:40s} {size/1024:6.1f} KB")
    print(f"total            : {total/1024:.1f} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
