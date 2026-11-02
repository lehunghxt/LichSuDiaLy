import { CheckCircle2, Lightbulb } from 'lucide-react'
import type { ReactNode } from 'react'

interface ChoiceButtonProps {
  children: ReactNode
  selected: boolean
  /** Sau khi khóa: đáp án này là đáp án đúng */
  correct: boolean
  locked: boolean
  onClick(): void
}

export function ChoiceButton({ children, selected, correct, locked, onClick }: ChoiceButtonProps) {
  const tone = !locked
    ? 'border-line bg-surface hover:border-primary hover:bg-primary-soft'
    : correct
      ? 'border-secondary bg-secondary-soft'
      : selected
        ? 'border-accent bg-accent-soft'
        : 'border-line bg-surface opacity-70'

  return (
    <button
      type="button"
      disabled={locked}
      onClick={onClick}
      className={`flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl border-2 px-5 py-3 text-left font-semibold transition-colors ${tone}`}
    >
      <span>{children}</span>
      {locked && correct && <CheckCircle2 aria-hidden className="size-6 shrink-0 animate-[pop_200ms_ease-out] text-secondary" />}
      {locked && selected && !correct && <Lightbulb aria-hidden className="size-6 shrink-0 text-accent" />}
    </button>
  )
}
