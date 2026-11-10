import type { Question } from '../../../../src/types/quiz'
import { isCorrect, score, shuffle } from '../../../../src/features/quiz/engine'

const base = { prompt: '?', explanation: '.', sources: [], status: 'verified' as const }
const sc: Question = { ...base, id: 'a', type: 'single_choice', options: ['A', 'B', 'C', 'D'], answerIndex: 2 }
const tf: Question = { ...base, id: 'b', type: 'true_false', answer: false }
const ml: Question = { ...base, id: 'c', type: 'map_locate', targetItemId: 'x', candidateItemIds: ['x', 'y'] }
const mt: Question = {
  ...base,
  id: 'd',
  type: 'matching',
  pairs: [
    { left: 'L0', right: 'R0' },
    { left: 'L1', right: 'R1' },
  ],
}

test('isCorrect single_choice', () => {
  expect(isCorrect(sc, { type: 'single_choice', index: 2 })).toBe(true)
  expect(isCorrect(sc, { type: 'single_choice', index: 0 })).toBe(false)
})

test('isCorrect true_false', () => {
  expect(isCorrect(tf, { type: 'true_false', value: false })).toBe(true)
  expect(isCorrect(tf, { type: 'true_false', value: true })).toBe(false)
})

test('isCorrect map_locate', () => {
  expect(isCorrect(ml, { type: 'map_locate', itemId: 'x' })).toBe(true)
  expect(isCorrect(ml, { type: 'map_locate', itemId: 'y' })).toBe(false)
})

test('isCorrect matching requires every pair', () => {
  expect(isCorrect(mt, { type: 'matching', pairs: { 0: 0, 1: 1 } })).toBe(true)
  expect(isCorrect(mt, { type: 'matching', pairs: { 0: 1, 1: 0 } })).toBe(false)
  expect(isCorrect(mt, { type: 'matching', pairs: { 0: 0 } })).toBe(false)
})

test('isCorrect returns false for mismatched answer type', () => {
  expect(isCorrect(sc, { type: 'true_false', value: true })).toBe(false)
})

test('score counts unanswered as wrong', () => {
  expect(score([sc, tf, ml], [{ type: 'single_choice', index: 2 }, undefined, { type: 'map_locate', itemId: 'x' }])).toEqual({
    correct: 2,
    total: 3,
  })
})

test('shuffle is a permutation and deterministic with injected rand', () => {
  const xs = [1, 2, 3, 4, 5]
  const out = shuffle(xs, () => 0)
  expect([...out].sort()).toEqual(xs)
  expect(out).not.toBe(xs)
  expect(xs).toEqual([1, 2, 3, 4, 5])
  expect(shuffle(xs, () => 0)).toEqual(out)
})
