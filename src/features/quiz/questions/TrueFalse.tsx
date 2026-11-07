import type { TrueFalseQuestion } from '../../../types/quiz'
import type { QuestionViewProps } from '../registry'
import { ChoiceButton } from './ChoiceButton'
import { GRID } from '../../../components/ui/grid'

const OPTIONS = [
  { value: true, label: 'Đúng' },
  { value: false, label: 'Sai' },
]

export function TrueFalse({ question, answer, onAnswer, locked }: QuestionViewProps<TrueFalseQuestion>) {
  const chosen = answer?.type === 'true_false' ? answer.value : undefined
  return (
    <ul className={`${GRID.sm} gap-3`}>
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
