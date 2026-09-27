import type { ReactNode } from 'react'

type Variant = 'primary' | 'outline'
type Size = 'md' | 'lg'

const base =
  'group inline-flex items-center justify-center gap-2.5 rounded-xl font-medium ' +
  'transition-all duration-300 ease-out select-none whitespace-nowrap'

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-primary-foreground border border-primary shadow-sm hover:bg-accent hover:border-accent hover:shadow-lift active:translate-y-px',
  outline:
    'bg-transparent text-foreground border border-border shadow-plate hover:border-foreground/25 hover:bg-muted hover:shadow-card',
}

const sizes: Record<Size, string> = {
  // Comfortable 44px minimum touch target without oversized buttons.
  md: 'h-11 px-5 text-[0.9375rem]',
  lg: 'h-12 px-6 text-base',
}

type ButtonLinkProps = {
  children: ReactNode
  href: string
  variant?: Variant
  size?: Size
  external?: boolean
  className?: string
}

export function ButtonLink({
  children,
  href,
  variant = 'primary',
  size = 'md',
  external = false,
  className = '',
}: ButtonLinkProps) {
  return (
    <a
      href={href}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
      {external ? <span className="sr-only"> — откроется в новой вкладке</span> : null}
    </a>
  )
}
