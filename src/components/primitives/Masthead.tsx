import { useEffect, useState } from 'react'
import { Send } from 'lucide-react'
import { links, nav, profile } from '@/content'
import { ThemeToggle } from '@/components/primitives/ThemeToggle'

/**
 * Sticky masthead. Quiet by default; gains a paper backdrop and a hairline
 * only after the hero has left the viewport, so the first screen stays clean.
 */
export function Masthead() {
  const [pinned, setPinned] = useState(false)

  useEffect(() => {
    const onScroll = () => setPinned(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ease-out ${
        pinned
          ? 'border-b border-border bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70'
          : 'border-b border-transparent'
      }`}
    >
      <div className="shell flex h-16 items-center justify-between gap-3 md:h-[4.5rem] md:gap-6">
        <a
          href="#top"
          className="-ml-1 shrink-0 whitespace-nowrap rounded-md px-1 py-1 font-display text-sm font-semibold tracking-[-0.01em] transition-colors duration-300 hover:text-accent md:text-[0.9375rem]"
        >
          {profile.name}
        </a>

        <div className="flex items-center gap-2 md:gap-3">
          <nav aria-label="Разделы страницы">
            <ul className="hidden items-center gap-1 md:flex lg:gap-2">
              {nav.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="inline-flex h-9 items-center rounded-lg px-2.5 text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-muted hover:text-foreground lg:px-3"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <a
            href={links.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-[0.8125rem] font-medium shadow-plate transition-all duration-300 hover:border-foreground/25 hover:bg-foreground hover:text-background hover:shadow-card md:h-9 md:rounded-lg md:text-sm"
          >
            <Send className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span className="hidden sm:inline">Написать</span>
            <span className="sr-only"> в Telegram — откроется в новой вкладке</span>
          </a>

          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
