// Làm trọn một bài trắc nghiệm trong trình duyệt thật; kết quả còn sau khi tải lại trang (localStorage)
import { answerQuiz, expect, quizzes, test } from './fixtures'

const quiz = quizzes[0]!
const n = quiz.questions.length

test('finish a quiz with full marks; the score survives a reload and shows on the progress page', async ({ page }) => {
  await page.goto('/on-tap')
  await page.getByRole('link', { name: new RegExp(quiz.title) }).click()
  await expect(page).toHaveURL(`/on-tap/${quiz.id}`)
  await expect(page.getByRole('heading', { level: 1, name: quiz.title })).toBeVisible()

  await answerQuiz(page, quiz)
  await expect(page.getByRole('heading', { name: `Em đúng ${n}/${n} câu` })).toBeVisible()
  // Điểm được ghi vào localStorage trong effect, ngay sau khi màn kết quả hiện: đợi ghi xong rồi mới rời trang
  await expect.poll(() => page.evaluate(() => Object.values(localStorage).join())).toContain(quiz.id)

  await page.goto('/tien-do')
  await page.reload()
  const stats = page.getByRole('list', { name: 'Thống kê' })
  await expect(stats.locator('li', { hasText: 'Bài đã hoàn thành' })).toContainText('1')
  await expect(stats.locator('li', { hasText: 'Điểm cao nhất' })).toContainText(`${n}/${n}`)

  await page.goto('/on-tap')
  await expect(page.getByRole('link', { name: new RegExp(quiz.title) })).toContainText('Làm lại')
})

test('every quiz in the data opens and shows its first question', async ({ page }) => {
  for (const q of quizzes) {
    await page.goto(`/on-tap/${q.id}`)
    await expect(page.getByRole('heading', { level: 1, name: q.title })).toBeVisible()
    await expect(page.getByText(`Câu 1/${q.questions.length}`)).toBeVisible()
  }
})
