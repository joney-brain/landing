import { services } from '@/content'
import { Reveal } from '@/components/primitives/Reveal'
import { SectionHeading } from '@/components/primitives/SectionHeading'

/**
 * A grid of cards on a deliberately uneven cadence: the two long titles get
 * the 7-column slot, the two short ones the 5-column slot, so no card has to
 * break a heading into an awkward stack.
 */
const spans = ['lg:col-span-7', 'lg:col-span-5', 'lg:col-span-7', 'lg:col-span-5']

const titleSizes = [
  'text-[1.375rem] md:text-[1.5rem]',
  'text-[1.25rem] md:text-[1.375rem]',
  'text-[1.375rem] md:text-[1.5rem]',
  'text-[1.25rem] md:text-[1.375rem]',
]

export function Services() {
  return (
    <section
      id="services"
      aria-labelledby="services-title"
      className="py-16 md:py-24 lg:py-28"
    >
      <div className="shell">
        <SectionHeading index="02" id="services-title" title="С чем я могу вам помочь" />

        <ul className="grid gap-4 sm:gap-5 lg:grid-cols-12">
          {services.map((service, i) => (
            <Reveal
              as="li"
              key={service.title}
              delay={i * 90}
              className={`card p-6 md:p-8 ${spans[i]}`}
            >
              <h3
                className={`font-display font-semibold leading-[1.14] tracking-[-0.015em] text-card-foreground transition-colors duration-300 ${titleSizes[i]}`}
              >
                {service.title}
              </h3>

              <p className="measure mt-4 text-[0.9375rem] leading-relaxed text-muted-foreground md:text-base">
                {service.text}
              </p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
