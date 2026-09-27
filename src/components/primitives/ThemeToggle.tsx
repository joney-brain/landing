import { Monitor, Moon, Sun } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTheme, type ThemePreference } from '@/hooks/useTheme'

type Option = {
  value: ThemePreference
  label: string
  icon: LucideIcon
}

const OPTIONS: Option[] = [
  { value: 'light', label: 'Светлая тема', icon: Sun },
  { value: 'dark', label: 'Тёмная тема', icon: Moon },
  { value: 'system', label: 'Как в системе', icon: Monitor },
]

/** Segmented three-state control. Filled segment = active state. */
export function ThemeToggle() {
  const { preference, setPreference } = useTheme()

  return (
    <div
      role="group"
      aria-label="Тема оформления"
      className="flex items-center gap-0.5 rounded-xl border border-border bg-card p-0.5 shadow-plate"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = preference === value
        return (
          <button
            key={value}
            type="button"
            onClick={() => setPreference(value)}
            aria-pressed={active}
            className={`flex size-9 items-center justify-center rounded-[0.625rem] transition-all duration-300 ease-out md:size-10 ${
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Icon className="size-[1.05rem]" strokeWidth={1.7} aria-hidden="true" />
            <span className="sr-only">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
