import type { HomeSummary } from '../../src/types/homeSummary'

export function summarySourceFiles(dataDir: string): string[]
export function buildHomeSummary(dataDir: string, isPublished: (status: string) => boolean): HomeSummary
