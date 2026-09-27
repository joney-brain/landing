import { strengths } from '@/content'
import { Reveal } from '@/components/primitives/Reveal'
import { SectionHeading } from '@/components/primitives/SectionHeading'

/**
 * Manifesto, not cards. Each principle is one wide Swiss row split into three
 * columns — marker / claim / argument — separated by hairlines. No photography:
 * the section earns its weight from type scale and measure alone.
 */
export function Strengths() {
  return (
    <section
      id="strengths"
      aria-labelledby="strengths-title"
      className="py-16 md:py-24 lg:py-28"
    >
      <div className="shell">
        <SectionHeading index="04" id="strengths-title" title="Сильные стороны" />

        <ul>
          {strengths.map(({ icon: Icon, title, text }, i) => (
            <Reveal
              as="li"
              key={title}
              delay={i * 110}
              className={`grid gap-x-8 gap-y-5 border-t border-border py-9 md:py-11 lg:grid-cols-12 lg:gap-y-0 lg:py-12 ${
                i === strengths.length - 1 ? 'border-b' : ''
              }`}
            >
              {/* Marker rail */}
              <div className="flex items-center gap-4 lg:col-span-2">
                <span
                  aria-hidden="true"
                  className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-accent shadow-plate transition-all duration-300 ease-out hover:border-accent/40 hover:bg-accent/5 lg:size-12"
                >
                  <Icon className="size-5 lg:size-[1.375rem]" strokeWidth={1.6} />
                </span>
              </div>

              {/* Claim */}
              <h3 className="font-display text-[clamp(1.5rem,2.6vw,2.125rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-foreground lg:col-span-5 lg:pr-4">
                {title}
              </h3>

              {/* Argument */}
              <p className="measure text-[0.9375rem] leading-relaxed text-muted-foreground md:text-base lg:col-span-5">
                {text}
              </p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
