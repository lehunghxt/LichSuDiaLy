// Dữ liệu giả CHỈ dùng cho test, không phải nội dung học tập.
import { SGK_URL } from '../lib/sources'

export { SGK_URL }

type Raw = Record<string, unknown>

export interface RawRegionContent {
  region: Raw
  intro: string
  items: Raw[]
  quizzes: (Raw & { questions: Raw[] })[]
}

export function rawRegionContent(): RawRegionContent {
  return {
    region: { id: 'vung-a', name: 'Vùng A', shortName: 'A', color: 'region-tdmnpb', status: 'active' },
    intro: 'Giới thiệu vùng A.',
    items: [
      {
        id: 'vung-a__dia-danh-1',
        regionId: 'vung-a',
        section: 'thien-nhien',
        title: 'Địa danh 1',
        summary: 'Tóm tắt 1.',
        highlights: ['Nổi bật 1'],
        keyPoints: ['Ghi nhớ 1'],
        location: { lat: 22.3, lng: 103.8, placeName: 'Tỉnh X' },
        images: [],
        relatedIds: ['vung-a__khoang-san-1'],
        sources: [{ title: 'SGK', url: SGK_URL, note: 'tr. 1' }],
        status: 'verified',
      },
      {
        id: 'vung-a__khoang-san-1',
        regionId: 'vung-a',
        section: 'dan-cu-san-xuat',
        title: 'Khoáng sản 1',
        summary: 'Tóm tắt 2.',
        highlights: [],
        keyPoints: [],
        images: [],
        relatedIds: [],
        sources: [],
        status: 'draft',
      },
    ],
    quizzes: [
      {
        id: 'vung-a__on-tap-1',
        regionId: 'vung-a',
        title: 'Ôn tập 1',
        questions: [
          {
            id: 'q1',
            type: 'single_choice',
            prompt: 'Câu 1?',
            options: ['A', 'B', 'C', 'D'],
            answerIndex: 2,
            explanation: 'Vì C.',
            sources: [{ title: 'SGK', url: SGK_URL }],
            status: 'verified',
          },
          {
            id: 'q2',
            type: 'true_false',
            prompt: 'Câu 2?',
            answer: false,
            explanation: 'Sai.',
            sources: [],
            status: 'draft',
          },
        ],
      },
    ],
  }
}
