import { useEffect, useState } from 'react'
import type { MapLocateQuestion } from '../../../types/quiz'
import { useRegionContent } from '../../content/useRegionContent'
import { geoLoader, type AreaCollection, type RegionFeatureProps } from '../../map/geo'
import { POINT_LETTERS } from '../engine'
import type { QuestionViewProps } from '../registry'
import { ChoiceButton } from './ChoiceButton'
import { LocatePins, type Pin } from './LocatePins'

/** id mục có dạng "<vùng>__<tên>", nên vùng của câu hỏi lấy từ mục đáp án */
const regionOf = (itemId: string) => itemId.split('__')[0] ?? ''

function useRegionShapes() {
  const [data, setData] = useState<AreaCollection<RegionFeatureProps> | null>(null)
  useEffect(() => {
    let cancelled = false
    geoLoader.loadRegions().then((r) => {
      if (!cancelled && r.ok) setData(r.data)
    })
    return () => {
      cancelled = true
    }
  }, [])
  return data
}

export function MapLocate({ question, answer, onAnswer, locked }: QuestionViewProps<MapLocateQuestion>) {
  const regionId = regionOf(question.targetItemId)
  const content = useRegionContent(regionId)
  const shapes = useRegionShapes()
  const chosen = answer?.type === 'map_locate' ? answer.itemId : undefined
  const choose = (itemId: string) => onAnswer({ type: 'map_locate', itemId })

  const items = content.status === 'ready' ? content.content.items : []
  const pins: Pin[] = question.candidateItemIds.flatMap((id, i) => {
    const location = items.find((it) => it.id === id)?.location
    return location ? [{ id, label: POINT_LETTERS[i] ?? '?', lat: location.lat, lng: location.lng }] : []
  })

  return (
    <div className="flex flex-col gap-4">
      {shapes && pins.length > 0 && (
        <LocatePins
          regions={shapes}
          regionId={regionId}
          pins={pins}
          onPick={choose}
          chosenId={chosen}
          correctId={question.targetItemId}
          locked={locked}
        />
      )}
      <ul className="grid gap-3 sm:grid-cols-3" aria-label="Các điểm trên bản đồ">
        {question.candidateItemIds.map((id, i) => (
          <li key={id}>
            <ChoiceButton selected={chosen === id} correct={id === question.targetItemId} locked={locked} onClick={() => choose(id)}>
              Điểm {POINT_LETTERS[i]}
            </ChoiceButton>
          </li>
        ))}
      </ul>
    </div>
  )
}
