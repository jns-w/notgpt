import {atom} from 'jotai'
import {atomWithStorage} from 'jotai/utils'
import {SuggestionItem} from "../types/suggestions";

type InputState = {
  input: string
  display: string
}

export const historyAtom = atomWithStorage<string[]>('NGPT_HIST', [])
export const suggestionsCountAtom = atom<number>(0)
export const hightlightedSuggestionAtom = atom<number | null>(null)
export const suggestionsAtom = atom<SuggestionItem[]>([])
export const inputAtom = atom<InputState>({
  input: "",
  display: "",
})
