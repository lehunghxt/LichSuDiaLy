import type { useSheetDrag } from './useSheetDrag'

interface SheetHandleProps {
  handlers: ReturnType<typeof useSheetDrag>['handlers']
  /** Có nhãn: thanh nắm là nút bấm được (bàn phím, trình đọc màn hình). Không nhãn: chỉ để kéo bằng tay */
  label?: string
  expanded?: boolean
  onClick?(): void
}

/** Thanh nắm ở đầu bottom sheet */
export function SheetHandle({ handlers, label, expanded, onClick }: SheetHandleProps) {
  const bar = <span aria-hidden className="h-1.5 w-12 rounded-full bg-line" />
  const className = 'flex h-7 w-full shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing'
  if (label === undefined) {
    return (
      <div data-testid="sheet-handle" aria-hidden {...handlers} className={className}>
        {bar}
      </div>
    )
  }
  return (
    <button type="button" aria-label={label} aria-expanded={expanded} onClick={onClick} {...handlers} className={className}>
      {bar}
    </button>
  )
}
