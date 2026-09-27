import { Reveal, Rule } from '@/components/primitives/Reveal'

type SectionHeadingProps = {
  /** Two-digit editorial index, e.g. "02". */
  index: string
  /** id of the <h2>, referenced by the section's aria-labelledby. */
  id: string
  title: string
  subtitle?: string
}

/**
 * Shared section masthead: a vermilion index, a hairline that draws itself in,
 * then the title. The title deliberately stays quieter than the content it
 * introduces — hierarchy comes from the copy below it.
 */
export function SectionHeading({ index, id, title, subtitle }: SectionHeadingProps) {
  return (
    <div className="mb-12 md:mb-16 lg:mb-20">
      <div className="flex items-center gap-4 md:gap-6">
        <span className="eyebrow shrink-0 pt-0.5 tabular-nums">{index}</span>
        <Rule />
      </div>

      <Reveal delay={80}>
        <h2
          id={id}
          className="section-title mt-6 text-[clamp(2.1rem,6vw,3.75rem)] text-balance"
        >
          {title}
        </h2>
      </Reveal>

      {subtitle ? (
        <Reveal delay={150}>
          <p className="measure mt-5 text-[0.9375rem] leading-relaxed text-muted-foreground md:text-base">
            {subtitle}
          </p>
        </Reveal>
      ) : null}
    </div>
  )
}
