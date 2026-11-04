/** Khung chờ trong lúc ảnh đang tải: nền xám có vệt sáng chạy ngang */
export function ImageSkeleton({ className = '' }: { className?: string }) {
  return (
    <span data-testid="image-skeleton" aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden bg-line ${className}`}>
      <span className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </span>
  )
}
