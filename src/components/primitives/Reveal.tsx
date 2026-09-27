import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
  type RefObject,
} from 'react'

/* ------------------------------------------------------------------ *
 *  Scroll reveal — a single, non-looping entrance driven by
 *  IntersectionObserver. Timing lives in CSS (see index.css) and is fed
 *  from here through one custom property, so components stay declarative.
 *  Everything yields to prefers-reduced-motion.
 * ------------------------------------------------------------------ */

function useInView<T extends HTMLElement>(
  options: IntersectionObserverInit = { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShown(true)
        observer.disconnect()
      }
    }, options)

    observer.observe(node)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return [ref, shown]
}

type RevealProps = {
  children: ReactNode
  as?: ElementType
  /** Stagger in ms. */
  delay?: number
  className?: string
  role?: string
}

export function Reveal({ children, as: Tag = 'div', delay = 0, className, role }: RevealProps) {
  const [ref, shown] = useInView<HTMLElement>()

  return (
    <Tag
      ref={ref}
      role={role}
      data-reveal={shown ? 'shown' : 'hidden'}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
      className={className}
    >
      {children}
    </Tag>
  )
}

/** Hairline rule that draws itself in once, on first view. */
export function Rule({ className = '', delay = 0 }: { className?: string; delay?: number }) {
  const [ref, shown] = useInView<HTMLDivElement>({ rootMargin: '0px 0px -8% 0px' })

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-rule={shown ? 'shown' : 'hidden'}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
      className={`h-px w-full origin-left bg-border ${className}`}
    />
  )
}
