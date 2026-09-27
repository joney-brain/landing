import { results } from '@/content'
import { Reveal } from '@/components/primitives/Reveal'
import { SectionHeading } from '@/components/primitives/SectionHeading'

/**
 * The loudest block on the page. Figures are the visual content, not labels
 * inside boxes: a 1px rule grid holds the composition together and the two
 * headline figures run at display scale.
 *
 * On phones the grid stacks, so a left-aligned column of figures would hang
 * off the left edge with a hard rule beside it. Below `md` each cell is
 * centred and the rules stay as the only structure; from `md` up it becomes a
 * table and left alignment returns.
 */
const spans = [
  'lg:col-span-7',
  'lg:col-span-5',
  'md:col-span-4 lg:col-span-4',
  'md:col-span-4 lg:col-span-4',
  'md:col-span-4 lg:col-span-4',
]

const figureSizes = [
  'text-[clamp(2.9rem,9vw,6rem)]',
  'text-[clamp(2.9rem,9vw,6rem)]',
  'text-[clamp(1.9rem,4.6vw,3rem)]',
  'text-[clamp(1.9rem,4.6vw,3rem)]',
  'text-[clamp(1.9rem,4.6vw,3rem)]',
]

const figureStyles = [
  'py-10 md:py-12 lg:px-12 lg:py-16',
  'py-10 md:py-12 lg:px-12 lg:py-16',
  'py-9 md:py-10 lg:px-8',
  'py-9 md:py-10 lg:px-8',
  'py-9 md:py-10 lg:px-8',
]

export function Results() {
  return (
    <section
      id="results"
      aria-labelledby="results-title"
      className="border-y border-border bg-muted py-16 md:py-24 lg:py-28"
    >
      <div className="shell">
        <SectionHeading
          index="03"
          id="results-title"
          title="Измеримые результаты"
          subtitle="Цифры последнего периода работы с аудиторией и дистрибуцией:"
        />

        <div
          role="list"
          className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border text-center md:grid-cols-2 md:text-left lg:grid-cols-12"
        >
          {results.map((item, i) => (
            <Reveal
              key={item.figure}
              role="listitem"
              delay={(i % 2) * 80}
              className={`${spans[i]} ${figureStyles[i]} flex flex-col items-center bg-muted px-6 md:col-span-1 md:items-stretch md:px-0 lg:col-span-1`}
            >
              <p className={`figure ${figureSizes[i]} text-foreground`}>{item.figure}</p>

              {item.figureAccent ? (
                <p className="mt-3 font-sans text-[0.9375rem] font-medium tabular-nums text-accent">
                  {item.figureAccent}
                </p>
              ) : null}

              <p
                className={`measure mt-5 text-[0.9375rem] leading-relaxed text-muted-foreground md:text-base ${
                  item.figureAccent ? 'mt-4' : ''
                }`}
              >
                {item.caption.map((part, j) =>
                  'emphasis' in part && part.emphasis ? (
                    <span key={j} className="font-medium text-foreground">
                      {part.text}
                    </span>
                  ) : (
                    <span key={j}>{part.text}</span>
                  ),
                )}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
