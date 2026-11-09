import type { SingleChoiceQuestion } from '../../../types/quiz'
import type { QuestionViewProps } from '../registry'
import { ChoiceButton } from './ChoiceButton'

const MARKERS = ['A', 'B', 'C', 'D']

export function SingleChoice({ question, answer, onAnswer, locked }: QuestionViewProps<SingleChoiceQuestion>) {
  const chosen = answer?.type === 'single_choice' ? answer.index : undefined
  return (
    // Bốn đáp án: một cột khi khung hẹp, lưới 2×2 khi đủ rộng (không để một đáp án lẻ một hàng)
    <ul className="grid gap-3 @xl:grid-cols-2">
      {question.options.map((option, index) => (
        <li key={index}>
          <ChoiceButton
            selected={chosen === index}
            correct={index === question.answerIndex}
            locked={locked}
            marker={MARKERS[index]}
            onClick={() => onAnswer({ type: 'single_choice', index })}
          >
            {option}
          </ChoiceButton>
        </li>
      ))}
    </ul>
  )
}
