// Luồng học sinh: chọn bài → làm bài → xem kết quả → Tiến độ học tập → xoá tiến độ.
// Dùng dữ liệu thật và router thật, không mock repository
import { screen, within } from '@testing-library/react'
import { PROGRESS_KEY } from '../../src/features/progress/progress'
import { correctClicks, wrongClicks } from '../support/quizAnswers'
import { answerQuiz, realQuizzes, renderApp } from './app'

const firstQuiz = realQuizzes[0]!

test('the data has at least one quiz per region', () => {
  expect(new Set(realQuizzes.map((q) => q.regionId)).size).toBe(4)
})

test('quiz list shows one card per real quiz with its question count', async () => {
  renderApp('/on-tap')
  for (const quiz of realQuizzes) {
    const link = await screen.findByRole('link', { name: new RegExp(quiz.title) })
    expect(link).toHaveAttribute('href', `/on-tap/${quiz.id}`)
    expect(link.closest('li')).toHaveTextContent(`${quiz.questions.length} câu`)
  }
})

test.each(realQuizzes.map((q) => [q.title, q] as const))('"%s": answering every question correctly scores full marks', async (_, quiz) => {
  const { user } = renderApp('/on-tap')
  await user.click(await screen.findByRole('link', { name: new RegExp(quiz.title) }))
  expect(await screen.findByRole('heading', { level: 1, name: quiz.title })).toBeInTheDocument()

  await answerQuiz(user, quiz)

  const n = quiz.questions.length
  expect(screen.getByRole('heading', { name: `Em đúng ${n}/${n} câu` })).toBeInTheDocument()
  expect(screen.getByText('Tuyệt vời! Em đã trả lời đúng tất cả các câu.')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Xem lại câu sai' })).toBeNull()
})

test('a wrong answer shows feedback, appears in "Xem lại câu sai", and "Chơi lại" starts over', async () => {
  const quiz = realQuizzes.find((q) => q.questions[0]?.type === 'single_choice' || q.questions[0]?.type === 'true_false')!
  const first = quiz.questions[0]!
  const { user } = renderApp(`/on-tap/${quiz.id}`)

  await answerQuiz(user, quiz, (q, i) => (i === 0 ? wrongClicks(q) : correctClicks(q)))

  const n = quiz.questions.length
  expect(screen.getByRole('heading', { name: `Em đúng ${n - 1}/${n} câu` })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Ôn lại trên bản đồ' })).toHaveAttribute('href', `/ban-do/${quiz.regionId}`)

  await user.click(screen.getByRole('button', { name: 'Xem lại câu sai' }))
  const review = screen.getByRole('list', { name: 'Các câu cần xem lại' })
  expect(within(review).getAllByRole('listitem')).toHaveLength(1)
  expect(review).toHaveTextContent(first.prompt)
  expect(review).toHaveTextContent('Đáp án đúng:')

  await user.click(screen.getByRole('button', { name: 'Chơi lại' }))
  expect(screen.getByText(`Câu 1/${n}`)).toBeInTheDocument()
})

test('a finished quiz is recorded: progress page and quiz list reflect it, across client-side navigation', async () => {
  const { user, router } = renderApp(`/on-tap/${firstQuiz.id}`)
  await answerQuiz(user, firstQuiz)
  const n = firstQuiz.questions.length

  const stored = JSON.parse(localStorage.getItem(PROGRESS_KEY)!)
  expect(stored.quizzes[firstQuiz.id]).toMatchObject({ lastScore: n, bestScore: n, total: n, attempts: 1 })

  await user.click(within(screen.getByRole('navigation', { name: 'Điều hướng chính' })).getByRole('link', { name: 'Tiến độ học tập' }))
  expect(router.state.location.pathname).toBe('/tien-do')
  const stats = await screen.findByRole('list', { name: 'Thống kê' })
  expect(within(stats).getByText('Bài đã hoàn thành').closest('li')).toHaveTextContent('1')
  expect(within(stats).getByText('Điểm gần nhất').closest('li')).toHaveTextContent(`${n}/${n}`)
  expect(within(stats).getByText('Điểm cao nhất').closest('li')).toHaveTextContent(`${n}/${n}`)

  await user.click(within(screen.getByRole('navigation', { name: 'Điều hướng chính' })).getByRole('link', { name: 'Trắc nghiệm' }))
  const link = await screen.findByRole('link', { name: new RegExp(firstQuiz.title) })
  expect(link.closest('li')).toHaveTextContent(`Điểm cao nhất ${n}/${n}`)
  expect(link).toHaveTextContent('Làm lại')
})

test('retaking a quiz keeps the best score and counts attempts', async () => {
  const quiz = realQuizzes.find((q) => q.questions[0]?.type === 'single_choice' || q.questions[0]?.type === 'true_false')!
  const { user } = renderApp(`/on-tap/${quiz.id}`)
  await answerQuiz(user, quiz)
  await user.click(screen.getByRole('button', { name: 'Chơi lại' }))
  await answerQuiz(user, quiz, (q, i) => (i === 0 ? wrongClicks(q) : correctClicks(q)))

  const n = quiz.questions.length
  const record = JSON.parse(localStorage.getItem(PROGRESS_KEY)!).quizzes[quiz.id]
  expect(record).toMatchObject({ bestScore: n, total: n, attempts: 2, lastScore: n - 1 })
})

test('clearing progress asks for confirmation, then empties the page and the quiz list', async () => {
  const { user } = renderApp(`/on-tap/${firstQuiz.id}`)
  await answerQuiz(user, firstQuiz)
  await user.click(within(screen.getByRole('navigation', { name: 'Điều hướng chính' })).getByRole('link', { name: 'Tiến độ học tập' }))

  await user.click(await screen.findByRole('button', { name: 'Xóa tiến độ' }))
  // Huỷ: vẫn giữ tiến độ
  await user.click(screen.getByRole('button', { name: 'Không, giữ lại' }))
  expect(screen.getByRole('list', { name: 'Thống kê' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Xóa tiến độ' }))
  await user.click(screen.getByRole('button', { name: 'Có, xóa hết' }))
  expect(screen.getByText('Em chưa bắt đầu khám phá')).toBeInTheDocument()
  expect(JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '{"quizzes":{}}').quizzes).toEqual({})

  await user.click(within(screen.getByRole('navigation', { name: 'Điều hướng chính' })).getByRole('link', { name: 'Trắc nghiệm' }))
  const card = (await screen.findByRole('link', { name: new RegExp(firstQuiz.title) })).closest('li')!
  expect(card).toHaveTextContent('Chưa làm')
})
