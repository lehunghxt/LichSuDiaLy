// Dùng chung cho các spec e2e: dữ liệu thật đọc từ src/data, và fixture bắt lỗi JavaScript trên trang
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { expect, test as base, type Page } from '@playwright/test'
import type { Quiz } from '../../src/types/quiz'
import { correctClicks, type Click } from '../support/quizAnswers'

const DATA = path.resolve(import.meta.dirname, '../../src/data')
const readJson = <T,>(file: string): T => JSON.parse(readFileSync(file, 'utf8')) as T

export const regions = readJson<{ id: string; name: string }[]>(path.join(DATA, 'regions.json'))

export const quizzes: Quiz[] = readdirSync(path.join(DATA, 'regions')).flatMap((dir) => {
  try {
    return readJson<Quiz[]>(path.join(DATA, 'regions', dir, 'quizzes.json'))
  } catch {
    return []
  }
})

/** Mỗi test tự fail nếu trang ném lỗi JavaScript không bắt (pageerror) hay ghi console.error */
export const test = base.extend<{ pageErrors: string[] }>({
  pageErrors: [
    async ({ page }, use) => {
      const errors: string[] = []
      page.on('pageerror', (e) => errors.push(e.message))
      page.on('console', (m) => {
        // Ảnh/video từ máy chủ ngoài (Commons, YouTube) có thể không tải được: không phải lỗi của ứng dụng
        if (m.type() === 'error' && !m.text().startsWith('Failed to load resource')) errors.push(m.text())
      })
      await use(errors)
      expect(errors, 'lỗi JavaScript trên trang').toEqual([])
    },
    { auto: true },
  ],
})

export { expect }

export async function clickAll(page: Page, clicks: Click[]) {
  for (const { group, name } of clicks) {
    const scope = group ? page.getByRole('group', { name: group }) : page.getByRole('main')
    await scope.getByRole('button', { name, exact: true }).click()
  }
}

/** Trả lời đúng mọi câu của bài đang mở, tới màn kết quả */
export async function answerQuiz(page: Page, quiz: Quiz) {
  for (const [i, q] of quiz.questions.entries()) {
    await expect(page.getByText(`Câu ${i + 1}/${quiz.questions.length}`)).toBeVisible()
    await clickAll(page, correctClicks(q))
    const isLast = i === quiz.questions.length - 1
    await page.getByRole('button', { name: isLast ? 'Xem kết quả' : 'Câu tiếp theo' }).click()
  }
}
