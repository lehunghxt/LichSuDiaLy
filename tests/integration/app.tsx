// Dựng cả ứng dụng (routes thật, ProgressProvider trong AppLayout, dữ liệu thật trong src/data) cho test integration
import { render, screen, within } from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '../../src/app/router'
import type { Question, Quiz } from '../../src/types/quiz'
import { correctClicks, type Click } from '../support/quizAnswers'

const quizModules = import.meta.glob<Quiz[]>('../../src/data/regions/*/quizzes.json', { eager: true, import: 'default' })

/** Mọi bài trắc nghiệm có trong dữ liệu (tất cả nội dung đã duyệt nên đều được hiển thị) */
export const realQuizzes: Quiz[] = Object.values(quizModules).flat()

export function renderApp(path = '/') {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const user = userEvent.setup()
  render(<RouterProvider router={router} />)
  return { router, user }
}

export async function clickAll(user: UserEvent, clicks: Click[]) {
  for (const { group, name } of clicks) {
    const scope = group ? within(screen.getByRole('group', { name: group })) : screen
    await user.click(scope.getByRole('button', { name }))
  }
}

/** Trả lời từng câu theo `pick` (mặc định: đáp án đúng), bấm "Câu tiếp theo"/"Xem kết quả" sau mỗi câu */
export async function answerQuiz(user: UserEvent, quiz: Quiz, pick: (q: Question, i: number) => Click[] = correctClicks) {
  for (const [i, q] of quiz.questions.entries()) {
    await screen.findByText(`Câu ${i + 1}/${quiz.questions.length}`)
    await clickAll(user, pick(q, i))
    const isLast = i === quiz.questions.length - 1
    await user.click(screen.getByRole('button', { name: isLast ? 'Xem kết quả' : 'Câu tiếp theo' }))
  }
}
