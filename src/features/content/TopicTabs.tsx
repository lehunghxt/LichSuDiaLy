import { useRef, type KeyboardEvent } from 'react'
import { TOPIC_CATEGORIES, TOPIC_LABELS, type TopicCategory } from '../../types/content'
import { TOPIC_ICONS } from './topicIcons'

interface TopicTabsProps {
  selected: TopicCategory
  counts: Record<TopicCategory, number>
  onSelect(category: TopicCategory): void
}

export const tabId = (c: TopicCategory) => `tab-${c}`
export const panelId = (c: TopicCategory) => `panel-${c}`

/** Tab theo mẫu WAI-ARIA: mũi tên trái/phải (vòng lại), Home/End; chọn ngay khi di chuyển */
export function TopicTabs({ selected, counts, onSelect }: TopicTabsProps) {
  const refs = useRef(new Map<TopicCategory, HTMLButtonElement>())

  const move = (to: number) => {
    const n = TOPIC_CATEGORIES.length
    const next = TOPIC_CATEGORIES[(to + n) % n]
    if (!next) return
    onSelect(next)
    refs.current.get(next)?.focus()
  }

  const onKeyDown = (e: KeyboardEvent) => {
    const i = TOPIC_CATEGORIES.indexOf(selected)
    const target = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: TOPIC_CATEGORIES.length - 1 }[e.key]
    if (target === undefined) return
    e.preventDefault()
    move(target)
  }

  return (
    <div role="tablist" aria-label="Chủ đề khám phá" onKeyDown={onKeyDown} className="flex flex-wrap gap-2">
      {TOPIC_CATEGORIES.map((c) => {
        const Icon = TOPIC_ICONS[c]
        const active = c === selected
        return (
          <button
            key={c}
            ref={(el) => {
              if (el) refs.current.set(c, el)
              else refs.current.delete(c)
            }}
            type="button"
            role="tab"
            id={tabId(c)}
            aria-selected={active}
            aria-controls={panelId(c)}
            tabIndex={active ? 0 : -1}
            onClick={() => onSelect(c)}
            className={`inline-flex min-h-12 items-center gap-2 rounded-full border-2 px-4 font-semibold transition-colors ${
              active ? 'border-primary bg-primary text-white' : 'border-line bg-surface hover:border-primary'
            }`}
          >
            <Icon aria-hidden className="size-5" />
            {TOPIC_LABELS[c]}
            <span
              className={`rounded-full px-2 text-xs ${active ? 'bg-white/25 text-white' : 'bg-line text-muted'}`}
              aria-label={`${counts[c]} mục`}
            >
              {counts[c]}
            </span>
          </button>
        )
      })}
    </div>
  )
}
