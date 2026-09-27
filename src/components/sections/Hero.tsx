import { credentials, links, profile } from '@/content'
import { ButtonLink } from '@/components/primitives/ButtonLink'
import { Reveal } from '@/components/primitives/Reveal'

export function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-name"
      className="relative overflow-hidden border-b border-border"
    >
      {/* Faint editorial grid — a single hairline column, not decoration noise. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--color-border) 1px, transparent 1px)',
          backgroundSize: '8.3333% 100%',
          backgroundPosition: 'left top',
          opacity: 0.55,
          maskImage: 'linear-gradient(to bottom, black, transparent 78%)',
        }}
      />

      <div className="shell relative grid gap-12 pb-16 pt-14 md:pt-20 lg:grid-cols-12 lg:gap-x-10 lg:pb-24 lg:pt-24">
        {/* ---- Type column ------------------------------------------ */}
        <div className="lg:col-span-7 xl:col-span-7">
          <Reveal>
            <p className="eyebrow">{profile.role}</p>
          </Reveal>

          <h1 id="hero-name" className="mt-6 md:mt-8">
            <Reveal as="span" delay={90} className="block">
              <span className="display-name block text-[clamp(3.1rem,13.5vw,7.5rem)]">
                Евгений
              </span>
            </Reveal>{' '}
            <Reveal as="span" delay={170} className="block">
              <span className="display-name block text-[clamp(3.1rem,13.5vw,7.5rem)]">
                Колесников
              </span>
            </Reveal>
          </h1>

          <Reveal delay={250}>
            {/* Vermilion editorial caret sitting in the left margin of the lead. */}
            <p className="lead measure mt-8 border-l-2 border-accent pl-5 text-[clamp(1.0625rem,1.15rem+0.5vw,1.375rem)] text-foreground/85 md:mt-10 md:pl-6">
              {profile.lead}
            </p>
          </Reveal>

          <Reveal delay={330}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center md:mt-11">
              <ButtonLink href={links.telegram} variant="primary" size="lg" external>
                Написать в Telegram
              </ButtonLink>
              <ButtonLink href="#cases" variant="outline" size="lg">
                Смотреть портфолио
              </ButtonLink>
            </div>
          </Reveal>

          <Reveal delay={400}>
            <div className="mt-12 grid gap-x-10 gap-y-6 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:mt-16">
              {credentials.map((segments, i) => (
                <p
                  key={i}
                  className={`border-t-2 pt-4 text-[0.9375rem] leading-relaxed ${
                    i === 0
                      ? 'border-accent/60 font-medium text-foreground'
                      : 'border-rule-strong text-muted-foreground'
                  }`}
                >
                  {segments.map(({ text, href }, j) =>
                    href ? (
                      <a
                        key={j}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${text} — откроется в новой вкладке`}
                        className="rounded-sm text-inherit underline decoration-rule decoration-1 underline-offset-[3px] transition-colors duration-300 hover:text-accent hover:decoration-accent"
                      >
                        {text}
                      </a>
                    ) : (
                      <span key={j}>{text}</span>
                    ),
                  )}
                </p>
              ))}
            </div>
          </Reveal>
        </div>

        {/* ---- Portrait plate ---------------------------------------- */}
        <div className="lg:col-span-5 lg:pl-6 xl:col-span-5">
          <Reveal delay={140}>
            <figure className="relative">
              <div className="overflow-hidden rounded-2xl border border-border bg-muted shadow-card">
                <img
                  // Document-relative on purpose. An imported asset gets an
                  // absolute /assets/... url from the SSR build but a relative
                  // one from the client build, so the pre-render and the
                  // hydrated tree would disagree. A plain relative path is
                  // byte-identical in both and resolves correctly at a domain
                  // root and under a Pages subpath. Preloaded in index.html.
                  src="assets/portrait-hero.webp"
                  alt="Евгений Колесников, главный редактор техносайта Городских сервисов Яндекса"
                  width={819}
                  height={1024}
                  fetchPriority="high"
                  decoding="async"
                  className="aspect-4/5 w-full object-cover object-[50%_18%] md:aspect-16/10 md:object-[46%_30%] lg:aspect-4/5 lg:object-[50%_22%]"
                />
              </div>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-3 -left-3 hidden h-24 w-24 rounded-2xl border border-accent/35 sm:block"
              />
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
