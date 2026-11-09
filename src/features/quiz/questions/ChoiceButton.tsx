import { CheckCircle2, Lightbulb } from 'lucide-react'
import type { ReactNode } from 'react'

interface ChoiceButtonProps {
  children: ReactNode
  selected: boolean
  /** Sau khi khóa: đáp án này là đáp án đúng */
  correct: boolean
  locked: boolean
  /** Chữ cái đầu ô (A, B, C, D) để em dễ nói "em chọn B"; không có thì không hiện */
  marker?: string
  onClick(): void
}

export function ChoiceButton({ children, selected, correct, locked, marker, onClick }: ChoiceButtonProps) {
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
      className={`flex h-full min-h-16 w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-lg font-semibold transition-colors ${tone}`}
    >
      {marker && (
        <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-bg text-base font-bold text-primary">
          {marker}
        </span>
      )}
      <span className="flex-1">{children}</span>
      {locked && correct && <CheckCircle2 aria-hidden className="size-6 shrink-0 animate-[pop_200ms_ease-out] text-secondary" />}
      {locked && selected && !correct && <Lightbulb aria-hidden className="size-6 shrink-0 text-accent" />}
    </button>
  )
}
