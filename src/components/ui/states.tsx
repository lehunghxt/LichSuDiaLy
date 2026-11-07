import { AlertTriangle, Inbox, LoaderCircle, RotateCcw } from 'lucide-react'
import type { ReactNode } from 'react'

interface StateProps {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: StateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-line bg-surface p-8 text-center">
      <Inbox aria-hidden className="size-10 text-muted" />
      <p className="font-semibold">{title}</p>
      {description && <p className="text-muted">{description}</p>}
      {action}
    </div>
  )
}

interface ErrorStateProps extends StateProps {
  onRetry?: () => void
}

export function ErrorState({ title, description, action, onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-card border border-accent/40 bg-accent-soft p-8 text-center">
      <AlertTriangle aria-hidden className="size-10 text-accent" />
      <p className="font-semibold">{title}</p>
      {description && <p className="text-muted">{description}</p>}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-white hover:bg-primary-dark"
        >
          <RotateCcw aria-hidden className="size-5" />
          Thử lại
        </button>
      )}
      {action}
    </div>
  )
}

export function LoadingState({ label = 'Đang tải…' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 p-10 text-muted">
      <LoaderCircle aria-hidden className="size-6 animate-spin" />
      <span>{label}</span>
    </div>
  )
}
