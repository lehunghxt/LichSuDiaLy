import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Quiz } from '../../../../../src/types/quiz'
import { QuizRunner } from '../../../../../src/features/quiz/QuizRunner'

const quiz: Quiz = {
  id: 'vung-a__ghep',
  regionId: 'vung-a',
  title: 'Ghép',
  questions: [
    {
      id: 'm1',
      type: 'matching',
      prompt: 'Ghép địa danh với tỉnh.',
      pairs: [
        { left: 'Đền Hùng', right: 'Phú Thọ' },
        { left: 'Lũng Cú', right: 'Tuyên Quang' },
        { left: 'Bắc Hà', right: 'Lào Cai' },
      ],
      explanation: 'Giải thích ghép.',
      sources: [],
      status: 'verified',
    },
  ],
}

const left = () => screen.getByRole('group', { name: 'Cột trái' })
const right = () => screen.getByRole('group', { name: 'Cột phải' })
const pick = async (l: string, r: string) => {
  await userEvent.click(within(left()).getByRole('button', { name: new RegExp(l) }))
  await userEvent.click(within(right()).getByRole('button', { name: new RegExp(r) }))
}

test('"Kiểm tra" enabled only when all items are paired', async () => {
  render(<QuizRunner quiz={quiz} onComplete={() => {}} />)
  const check = screen.getByRole('button', { name: 'Kiểm tra' })
  expect(check).toBeDisabled()
  await pick('Đền Hùng', 'Phú Thọ')
  await pick('Lũng Cú', 'Tuyên Quang')
  expect(check).toBeDisabled()
  await pick('Bắc Hà', 'Lào Cai')
  expect(check).toBeEnabled()
})

test('tap left marks it selected (aria-pressed)', async () => {
  render(<QuizRunner quiz={quiz} onComplete={() => {}} />)
  const btn = within(left()).getByRole('button', { name: /Đền Hùng/ })
  await userEvent.click(btn)
  expect(btn).toHaveAttribute('aria-pressed', 'true')
})

test('tapping a paired item undoes the pair', async () => {
  render(<QuizRunner quiz={quiz} onComplete={() => {}} />)
  await pick('Đền Hùng', 'Phú Thọ')
  expect(within(left()).getByRole('button', { name: /Đền Hùng/ })).toHaveAccessibleName(/đã ghép với Phú Thọ/)
  await userEvent.click(within(right()).getByRole('button', { name: /Phú Thọ/ }))
  expect(within(left()).getByRole('button', { name: /Đền Hùng/ })).not.toHaveAccessibleName(/đã ghép/)
})

test('all correct pairs → correct feedback', async () => {
  render(<QuizRunner quiz={quiz} onComplete={() => {}} />)
  await pick('Đền Hùng', 'Phú Thọ')
  await pick('Lũng Cú', 'Tuyên Quang')
  await pick('Bắc Hà', 'Lào Cai')
  await userEvent.click(screen.getByRole('button', { name: 'Kiểm tra' }))
  expect(screen.getByTestId('feedback')).toHaveTextContent('Chính xác! Em đã trả lời đúng.')
  expect(screen.queryByRole('button', { name: 'Kiểm tra' })).toBeNull()
})

test('wrong pair → encouraging feedback with correct pairs', async () => {
  render(<QuizRunner quiz={quiz} onComplete={() => {}} />)
  await pick('Đền Hùng', 'Tuyên Quang')
  await pick('Lũng Cú', 'Phú Thọ')
  await pick('Bắc Hà', 'Lào Cai')
  await userEvent.click(screen.getByRole('button', { name: 'Kiểm tra' }))
  const feedback = screen.getByTestId('feedback')
  expect(feedback).toHaveTextContent('Em hãy cùng tìm hiểu lại nội dung này nhé!')
  expect(feedback).toHaveTextContent('Đền Hùng – Phú Thọ')
})

test('works with keyboard only', async () => {
  render(<QuizRunner quiz={quiz} onComplete={() => {}} />)
  within(left())
    .getByRole('button', { name: /Bắc Hà/ })
    .focus()
  await userEvent.keyboard('{Enter}')
  within(right())
    .getByRole('button', { name: /Lào Cai/ })
    .focus()
  await userEvent.keyboard('{Enter}')
  expect(within(left()).getByRole('button', { name: /Bắc Hà/ })).toHaveAccessibleName(/đã ghép với Lào Cai/)
})

test('next matching question and "Chơi lại" start with no pairs', async () => {
  const q = quiz.questions[0]!
  render(<QuizRunner quiz={{ ...quiz, questions: [q, { ...q, id: 'm2' }] }} onComplete={() => {}} />)
  await pick('Đền Hùng', 'Phú Thọ')
  await pick('Lũng Cú', 'Tuyên Quang')
  await pick('Bắc Hà', 'Lào Cai')
  await userEvent.click(screen.getByRole('button', { name: 'Kiểm tra' }))
  await userEvent.click(screen.getByRole('button', { name: 'Câu tiếp theo' }))
  expect(within(left()).getByRole('button', { name: /Đền Hùng/ })).not.toHaveAccessibleName(/đã ghép/)
  await pick('Đền Hùng', 'Phú Thọ')
  await pick('Lũng Cú', 'Tuyên Quang')
  await pick('Bắc Hà', 'Lào Cai')
  await userEvent.click(screen.getByRole('button', { name: 'Kiểm tra' }))
  await userEvent.click(screen.getByRole('button', { name: 'Xem kết quả' }))
  await userEvent.click(screen.getByRole('button', { name: 'Chơi lại' }))
  expect(within(left()).getByRole('button', { name: /Đền Hùng/ })).not.toHaveAccessibleName(/đã ghép/)
})
