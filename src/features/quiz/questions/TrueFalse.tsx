import type { TrueFalseQuestion } from '../../../types/quiz'
import type { QuestionViewProps } from '../registry'
import { ChoiceButton } from './ChoiceButton'

const OPTIONS = [
  { value: true, label: 'Đúng' },
  { value: false, label: 'Sai' },
]

export function TrueFalse({ question, answer, onAnswer, locked }: QuestionViewProps<TrueFalseQuestion>) {
  const chosen = answer?.type === 'true_false' ? answer.value : undefined
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {OPTIONS.map(({ value, label }) => (
        <li key={label}>
          <ChoiceButton
            selected={chosen === value}
            correct={question.answer === value}
            locked={locked}
            onClick={() => onAnswer({ type: 'true_false', value })}
          >
            {label}
          </ChoiceButton>
        </li>
      ))}
    </ul>
  )
}
