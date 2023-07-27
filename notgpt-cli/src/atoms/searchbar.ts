import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export const historyAtom = atomWithStorage<string[]>('NGPT_HIST', [])
export const suggestionsCountAtom = atom<number>(0)
export const selectedSuggestionAtom = atom<number | null>(null)