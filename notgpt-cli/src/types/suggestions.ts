export type SuggestionItem = {
  type: "header" | "history" | "trending" | "autocomplete",
  text: string,
  index?: number
}