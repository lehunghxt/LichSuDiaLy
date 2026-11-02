import { useContext } from 'react'
import { ProgressContext, type ProgressContextValue } from './progressContext'

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress phải nằm trong <ProgressProvider>')
  return ctx
}
