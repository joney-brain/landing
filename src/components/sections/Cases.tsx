import { ArrowUpRight } from 'lucide-react'
import { cases } from '@/content'
import { Reveal } from '@/components/primitives/Reveal'
import { SectionHeading } from '@/components/primitives/SectionHeading'

/**
 * An editorial index. Cards alternate 7 / 5 / 5 / 7 so the sequence has a
 * reading rhythm; the whole card is the link target and the arrow is the
 * affordance, not the only clickable pixels.
 */
const spans = ['lg:col-span-7', 'lg:col-span-5', 'lg:col-span-5', 'lg:col-span-7']

/** Type size follows the slot, not the position — case 4 carries the longest title. */
const titleSizes = [
  'text-[clamp(1.25rem,2.1vw,1.5rem)]',
  'text-[clamp(1.1875rem,1.6vw,1.3125rem)]',
  'text-[clamp(1.25rem,1.9vw,1.4375rem)]',
  'text-[clamp(1.25rem,2.1vw,1.5rem)]',
]

export function Cases() {
  return (
    <section
      id="cases"
      aria-labelledby="cases-title"
      className="py-16 md:py-24 lg:py-28"
    >
      <div className="shell">
        <SectionHeading index="05" id="cases-title" title="Кейсы и избранные материалы" />

        <ul className="grid gap-4 sm:gap-5 lg:grid-cols-12">
          {cases.map((item, i) => (
            <Reveal as="li" key={item.url} delay={(i % 2) * 90} className={`${spans[i]} group`}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card h-full p-6 md:p-8"
              >
                <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="eyebrow">{item.kind}</span>
                  <span className="text-[0.8125rem] tabular-nums text-muted-foreground">
                    {item.host}
                  </span>
                </p>

                <h3
                  className={`mt-3 font-display font-semibold leading-[1.14] tracking-[-0.018em] text-card-foreground transition-colors duration-300 group-hover:text-accent ${titleSizes[i]}`}
                >
                  {item.title}
                </h3>

                <p className="measure mt-4 flex-1 text-[0.9375rem] leading-relaxed text-muted-foreground md:text-base">
                  {item.text}
                </p>

                {/* Text link with the diagonal arrow, on a full-width rule */}
                <span className="mt-7 flex items-center border-t border-border pt-5">
                  <span className="inline-flex items-center gap-1.5 text-[0.875rem] font-medium text-foreground transition-colors duration-300 group-hover:text-accent">
                    Читать материал
                    <ArrowUpRight
                      className="size-4 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                    <span className="sr-only"> — откроется в новой вкладке</span>
                  </span>
                </span>
              </a>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
