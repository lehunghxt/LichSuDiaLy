import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Quiz } from '../../../../src/types/quiz'
import { QuizRunner } from '../../../../src/features/quiz/QuizRunner'

const base = { explanation: 'Giải thích.', sources: [], status: 'verified' as const }
const quiz: Quiz = {
  id: 'vung-a__on-tap-1',
  regionId: 'vung-a',
  title: 'Ôn tập',
  questions: [
    { ...base, id: 'q1', type: 'single_choice', prompt: 'Câu một?', options: ['A1', 'B1', 'C1', 'D1'], answerIndex: 1 },
    { ...base, id: 'q2', type: 'true_false', prompt: 'Câu hai?', answer: true },
    { ...base, id: 'q3', type: 'single_choice', prompt: 'Câu ba?', options: ['A3', 'B3', 'C3', 'D3'], answerIndex: 0 },
  ],
}

async function answerAll(choices: string[]) {
  for (const [i, name] of choices.entries()) {
    await userEvent.click(screen.getByRole('button', { name }))
    const next = i === choices.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo'
    await userEvent.click(screen.getByRole('button', { name: next }))
  }
}

test('shows progress, locks options after answering and shows correct feedback + explanation', async () => {
  render(<QuizRunner quiz={quiz} onComplete={() => {}} />)
  expect(screen.getByText('Câu 1/3')).toBeInTheDocument()
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1')
  await userEvent.click(screen.getByRole('button', { name: 'B1' }))
  expect(screen.getByRole('button', { name: 'A1' })).toBeDisabled()
  const feedback = screen.getByTestId('feedback')
  expect(feedback).toHaveTextContent('Chính xác! Em đã trả lời đúng.')
  expect(feedback).toHaveTextContent('Giải thích.')
  await userEvent.click(screen.getByRole('button', { name: 'Câu tiếp theo' }))
  expect(screen.getByText('Câu 2/3')).toBeInTheDocument()
})

test('wrong answer shows encouraging feedback and the correct answer', async () => {
  render(<QuizRunner quiz={quiz} onComplete={() => {}} />)
  await userEvent.click(screen.getByRole('button', { name: 'C1' }))
  const feedback = screen.getByTestId('feedback')
  expect(feedback).toHaveTextContent('Em hãy cùng tìm hiểu lại nội dung này nhé!')
  expect(feedback).toHaveTextContent('Đáp án đúng: B1')
})

test('true/false question offers Đúng and Sai', async () => {
  render(<QuizRunner quiz={{ ...quiz, questions: [quiz.questions[1]!] }} onComplete={() => {}} />)
  expect(screen.getByRole('button', { name: 'Đúng' })).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Sai' }))
  expect(screen.getByTestId('feedback')).toHaveTextContent('Đáp án đúng: Đúng')
})

test('result screen shows score, calls onComplete once, "Chơi lại" resets', async () => {
  const onComplete = vi.fn()
  render(<QuizRunner quiz={quiz} onComplete={onComplete} />)
  await answerAll(['B1', 'Sai', 'A3'])
  expect(screen.getByRole('heading', { name: 'Em đúng 2/3 câu' })).toBeInTheDocument()
  expect(onComplete).toHaveBeenCalledTimes(1)
  expect(onComplete).toHaveBeenCalledWith(2, 3)
  await userEvent.click(screen.getByRole('button', { name: 'Chơi lại' }))
  expect(screen.getByText('Câu 1/3')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'A1' })).toBeEnabled()
})

test('"Xem lại câu sai" lists only wrong questions with correct answer', async () => {
  render(<QuizRunner quiz={quiz} onComplete={() => {}} />)
  await answerAll(['B1', 'Sai', 'D3'])
  await userEvent.click(screen.getByRole('button', { name: 'Xem lại câu sai' }))
  const list = screen.getByRole('list', { name: 'Các câu cần xem lại' })
  const items = within(list).getAllByRole('listitem')
  expect(items).toHaveLength(2)
  expect(items[0]).toHaveTextContent('Câu hai?')
  expect(items[0]).toHaveTextContent('Đáp án đúng: Đúng')
  expect(items[1]).toHaveTextContent('Đáp án đúng: A3')
})

test('perfect score hides review button', async () => {
  render(<QuizRunner quiz={quiz} onComplete={() => {}} />)
  await answerAll(['B1', 'Đúng', 'A3'])
  expect(screen.queryByRole('button', { name: 'Xem lại câu sai' })).toBeNull()
})

test('keyboard: Tab to an option and Enter answers it', async () => {
  render(<QuizRunner quiz={quiz} onComplete={() => {}} />)
  await userEvent.tab()
  expect(screen.getByRole('button', { name: 'A1' })).toHaveFocus()
  await userEvent.keyboard('{Enter}')
  expect(screen.getByTestId('feedback')).toHaveTextContent('Em hãy cùng tìm hiểu lại nội dung này nhé!')
})
