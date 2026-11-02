import { CheckCircle2, Lightbulb } from 'lucide-react'
import { useState } from 'react'
import type { MatchingQuestion } from '../../../types/quiz'
import { shuffle } from '../engine'
import type { QuestionViewProps } from '../registry'

// Mỗi cặp đã ghép có một màu riêng để học sinh dễ nhìn
const PAIR_COLORS = [
  'border-sky-500 bg-sky-50',
  'border-violet-500 bg-violet-50',
  'border-pink-500 bg-pink-50',
  'border-teal-500 bg-teal-50',
  'border-orange-500 bg-orange-50',
  'border-lime-600 bg-lime-50',
]

const base = 'flex min-h-14 w-full items-center justify-between gap-2 rounded-2xl border-2 px-4 py-3 text-left font-semibold transition-colors'

export function Matching({ question, answer, onAnswer, locked }: QuestionViewProps<MatchingQuestion>) {
  const { pairs } = question
  // Cột phải được xáo trộn một lần khi hiện câu hỏi; chỉ số vẫn theo thứ tự gốc
  const [rightOrder] = useState(() => shuffle(pairs.map((_, i) => i)))
  const [draft, setDraft] = useState<Record<number, number>>({})
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null)

  const chosen = answer?.type === 'matching' ? answer.pairs : draft
  const leftOf = (r: number) => {
    const entry = Object.entries(chosen).find(([, v]) => v === r)
    return entry ? Number(entry[0]) : undefined
  }
  const colorOf = (l: number) => PAIR_COLORS[Object.keys(chosen).map(Number).sort((a, b) => a - b).indexOf(l) % PAIR_COLORS.length]

  const unpair = (l: number) =>
    setDraft((d) => Object.fromEntries(Object.entries(d).filter(([k]) => Number(k) !== l)))

  const onLeft = (l: number) => {
    if (chosen[l] !== undefined) {
      unpair(l)
      setSelectedLeft(null)
    } else setSelectedLeft((s) => (s === l ? null : l))
  }

  const onRight = (r: number) => {
    const owner = leftOf(r)
    if (owner !== undefined) {
      unpair(owner)
      return
    }
    if (selectedLeft === null) return
    setDraft((d) => ({ ...d, [selectedLeft]: r }))
    setSelectedLeft(null)
  }

  const resultIcon = (l: number) =>
    locked &&
    (chosen[l] === l ? (
      <CheckCircle2 aria-hidden className="size-6 shrink-0 text-secondary" />
    ) : (
      <Lightbulb aria-hidden className="size-6 shrink-0 text-accent" />
    ))

  return (
    <div>
      <p className="mb-4 text-muted">Chạm vào một ô bên trái, rồi chạm vào ô phù hợp bên phải. Chạm lại để bỏ ghép.</p>
      <div className="grid gap-6 md:grid-cols-2">
        <div role="group" aria-label="Cột trái" className="flex flex-col gap-3">
          {pairs.map((p, l) => {
            const r = chosen[l]
            const paired = r !== undefined
            const tone = paired ? colorOf(l) : selectedLeft === l ? 'border-primary bg-primary-soft' : 'border-line bg-surface hover:border-primary'
            return (
              <button
                key={l}
                type="button"
                disabled={locked}
                aria-pressed={selectedLeft === l}
                aria-label={paired ? `${p.left}, đã ghép với ${pairs[r]?.right}` : p.left}
                onClick={() => onLeft(l)}
                className={`${base} ${tone}`}
              >
                <span>{p.left}</span>
                {resultIcon(l)}
              </button>
            )
          })}
        </div>
        <div role="group" aria-label="Cột phải" className="flex flex-col gap-3">
          {rightOrder.map((r) => {
            const owner = leftOf(r)
            const tone = owner !== undefined ? colorOf(owner) : 'border-line bg-surface hover:border-primary'
            return (
              <button
                key={r}
                type="button"
                disabled={locked}
                aria-label={owner !== undefined ? `${pairs[r]?.right}, đã ghép với ${pairs[owner]?.left}` : pairs[r]?.right}
                onClick={() => onRight(r)}
                className={`${base} ${tone}`}
              >
                {pairs[r]?.right}
              </button>
            )
          })}
        </div>
      </div>
      {!locked && (
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            disabled={Object.keys(draft).length < pairs.length}
            onClick={() => onAnswer({ type: 'matching', pairs: draft })}
            className="inline-flex min-h-12 items-center rounded-full bg-secondary px-6 font-semibold text-white hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Kiểm tra
          </button>
        </div>
      )}
    </div>
  )
}
