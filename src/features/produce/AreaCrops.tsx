import { CropShowcase } from './CropShowcase'
import { useProduce } from './useProduce'

/** Cây trồng tiêu biểu của vùng, theo SGK */
export function RegionCrops({ regionId }: { regionId: string }) {
  const produce = useProduce()
  return produce && <CropShowcase groups={produce.forRegion(regionId)} source="sgk" />
}

/** Cây trồng tiêu biểu của tỉnh: ngoài SGK, ghi nguồn từng cây */
export function ProvinceCrops({ provinceId }: { provinceId: string }) {
  const produce = useProduce()
  return produce && <CropShowcase groups={produce.forProvince(provinceId)} source="ngoai-sgk" />
}
