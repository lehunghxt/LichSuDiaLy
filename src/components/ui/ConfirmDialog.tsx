import { useEffect, useId, useRef } from 'react'

interface ConfirmDialogProps {
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  onConfirm(): void
  onCancel(): void
}

export function ConfirmDialog({ title, description, confirmLabel, cancelLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  const titleId = useId()
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previous = document.activeElement
    cancelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      if (previous instanceof HTMLElement) previous.focus()
    }
  }, [onCancel])

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-ink/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-card bg-surface p-6 shadow-xl"
      >
        <h2 id={titleId} className="text-xl font-bold">
          {title}
        </h2>
        <p className="mt-2 text-muted">{description}</p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="min-h-11 rounded-full border border-line px-5 font-semibold hover:bg-bg"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="min-h-11 rounded-full bg-accent px-5 font-semibold text-ink hover:brightness-95"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
