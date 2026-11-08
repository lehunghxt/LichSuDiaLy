import { useEffect, useState } from 'react'
import { parseProduce, type Produce } from './produce'

let loading: Promise<Produce> | null = null

/** Tải dữ liệu cây trồng và ảnh một lần, khi lần đầu cần (không nằm trong chunk ban đầu); lỗi thì lần sau tải lại */
export function loadProduce(): Promise<Produce> {
  loading ??= Promise.all([import('../../data/produce/crops.json'), import('../../data/produce/images.json')])
    .then(([crops, images]) => parseProduce(crops.default, images.default))
    .catch((e: unknown) => {
      loading = null
      throw e
    })
  return loading
}

/** null khi đang tải hoặc tải lỗi: phần cây trồng chỉ là thông tin thêm, lỗi thì ẩn đi, không chặn khung thông tin */
export function useProduce(): Produce | null {
  const [produce, setProduce] = useState<Produce | null>(null)
  useEffect(() => {
    let cancelled = false
    loadProduce().then(
      (p) => !cancelled && setProduce(p),
      () => {},
    )
    return () => {
      cancelled = true
    }
  }, [])
  return produce
}
