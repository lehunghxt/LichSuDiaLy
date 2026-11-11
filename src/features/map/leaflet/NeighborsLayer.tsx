import { useMemo } from 'react'
import { GeoJSON, Pane } from 'react-leaflet'
import type { AreaCollection, NeighborFeatureProps } from '../geo'

/** Ngăn riêng, nằm dưới ngăn của vùng/tỉnh (overlayPane, thứ tự chồng 400): đất nước ngoài luôn ở dưới đất Việt Nam */
const PANE = 'neighbors'

/** Đất các nước xung quanh, tô xám làm nền. Không bấm, không rê chuột được */
export function NeighborsLayer({ data }: { data: AreaCollection<NeighborFeatureProps> }) {
  const style = useMemo(() => {
    const fill = getComputedStyle(document.documentElement).getPropertyValue('--color-foreign-land').trim() || '#d1d5db'
    return { stroke: false, fillColor: fill, fillOpacity: 1, interactive: false }
  }, [])
  return (
    <Pane name={PANE} style={{ zIndex: 350 }}>
      <GeoJSON data={data} style={style} interactive={false} />
    </Pane>
  )
}
