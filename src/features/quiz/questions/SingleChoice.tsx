import type { SingleChoiceQuestion } from '../../../types/quiz'
import type { QuestionViewProps } from '../registry'
import { ChoiceButton } from './ChoiceButton'
import { GRID } from '../../../components/ui/grid'

export function SingleChoice({ question, answer, onAnswer, locked }: QuestionViewProps<SingleChoiceQuestion>) {
  const chosen = answer?.type === 'single_choice' ? answer.index : undefined
  return (
    <ul className={`${GRID.md} gap-3`}>
      {question.options.map((option, index) => (
        <li key={index}>
          <ChoiceButton
            selected={chosen === index}
            correct={index === question.answerIndex}
            locked={locked}
            onClick={() => onAnswer({ type: 'single_choice', index })}
          >
            {option}
          </ChoiceButton>
        </li>
      ))}
    </ul>
  )
}
