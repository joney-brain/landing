import { ArrowUp, FileText, Mail, Send } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { links, profile } from '@/content'
import { Reveal, Rule } from '@/components/primitives/Reveal'

type ContactLink = {
  label: string
  href: string
  icon: LucideIcon
  external: boolean
  /** Extra context for screen readers, since the visible label is terse. */
  hint: string
}

const contactLinks: ContactLink[] = [
  {
    label: 'Telegram',
    href: links.telegram,
    icon: Send,
    external: true,
    hint: ' — откроется в новой вкладке',
  },
  {
    label: 'Email',
    href: links.email,
    icon: Mail,
    external: false,
    hint: '',
  },
  {
    label: 'Резюме',
    href: links.resume,
    icon: FileText,
    external: true,
    hint: ' — откроется в новой вкладке',
  },
]

/**
 * Closing plate. Inverted to warm ink so the page ends on contrast rather than
 * on a technical footer strip. The closing line is body copy, not a headline —
 * the plate and the contact row carry the emphasis.
 */
export function Contact() {
  return (
    <footer
      id="contact"
      aria-labelledby="contact-title"
      className="plate-ink bg-background text-foreground"
    >
      <div className="shell py-16 md:py-24 lg:py-28">
        <div className="flex items-center gap-4 md:gap-6">
          <Reveal>
            <span className="eyebrow shrink-0 pt-0.5 text-accent">06</span>
          </Reveal>
          <Rule delay={120} />
        </div>

        <div className="mt-10 grid gap-10 md:mt-12 lg:grid-cols-12 lg:items-end lg:gap-8">
          <Reveal delay={100} className="lg:col-span-6">
            <p
              id="contact-title"
              className="text-[clamp(1.375rem,2.6vw,2rem)] font-light leading-[1.3] tracking-[-0.015em] text-foreground"
            >
              Открыт к вашим предложениям
            </p>
          </Reveal>

          <Reveal delay={180} className="lg:col-span-6">
            <ul className="flex flex-wrap items-center gap-3 lg:justify-end">
              {contactLinks.map(({ label, href, icon: Icon, external, hint }) => (
                <li key={label}>
                  <a
                    href={href}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="group inline-flex items-center gap-2.5 rounded-xl border border-border bg-card px-5 py-3.5 text-base font-medium text-foreground shadow-plate transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-accent/50 hover:bg-muted hover:text-accent hover:shadow-lift focus-visible:border-accent active:translate-y-0"
                  >
                    <Icon
                      className="size-[1.2rem] shrink-0 text-muted-foreground transition-colors duration-300 group-hover:text-accent"
                      strokeWidth={1.6}
                      aria-hidden="true"
                    />
                    {label}
                    <span className="sr-only">{hint}</span>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* ---- Footer meta ------------------------------------------ */}
        <div className="mt-14 flex flex-col-reverse items-start gap-5 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between md:mt-16">
          <p className="text-[0.8125rem] text-muted-foreground">© {profile.name}</p>
          <a
            href="#top"
            className="group inline-flex h-9 items-center gap-2 rounded-lg text-[0.8125rem] font-medium text-muted-foreground transition-colors duration-300 hover:text-accent"
          >
            Наверх
            <ArrowUp
              className="size-4 transition-transform duration-300 ease-out group-hover:-translate-y-0.5"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    </footer>
  )
}
