import React, {useEffect, useRef, useState} from "react";
import {useDebounce, useEventListener, useIsomorphicLayoutEffect, useOnClickOutside} from "usehooks-ts";
import {AnimatePresence, motion} from "framer-motion";
import axios from "axios";
import {useAtom} from "jotai";
import {
  hightlightedSuggestionAtom,
  historyAtom,
  inputAtom,
  suggestionsAtom,
  suggestionsCountAtom
} from "../atoms/searchbar";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleLeft, faChartLine} from "@fortawesome/free-solid-svg-icons";
import {faClock} from "@fortawesome/free-regular-svg-icons";
import {SuggestionItem} from "../types/suggestions";


const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || "https://notgpt-server.capybara.wldspace.com"

type SearchBarProps = {
  searchFn: Function,
  query: string | undefined,
}

function SearchBar(props: SearchBarProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [inputState, setInputState] = useAtom(inputAtom)
  const debouncedInput = useDebounce(inputState.input, 200)
  const [lines, setLines] = useState(0)
  const [, setHighlighted] = useAtom(hightlightedSuggestionAtom)

  const [trending, setTrending] = useState<string[]>([])
  const [history, setHistory] = useAtom(historyAtom)
  const [autocompletes, setAutocompletes] = useState<string[]>([]
  )

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useOnClickOutside(inputRef, () => {
    setShowSuggestions(false)
    setHighlighted(null)
  })

  useEventListener("keypress", (ev) => {
    if (ev.target === inputRef.current) {
      setShowSuggestions(true)
    }
  }, inputRef)

  // Handling Typing
  function inputHandler(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInputState((prev) => (
      {
        ...prev,
        input: e.target.value,
        display: e.target.value
      }
    ))
    // setHighlighted(null)
    if (inputState.input.length === 0) {
      setAutocompletes([])
    }
  }

  function keyHandler(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      if (!inputState.input) return;
      props.searchFn(inputState.display)
    }
  }


  // Handling multi-line search terms
  // we check for length of typed text
  function getWidth(): number {
    const canvas: HTMLCanvasElement = canvasRef.current!
    const context = canvas.getContext("2d") as CanvasRenderingContext2D
    const inputStyles: CSSStyleDeclaration = window.getComputedStyle(inputRef.current!);
    context.font = `${inputStyles.getPropertyValue("font-weight")} ${inputStyles.getPropertyValue("font-size")} ${inputStyles.getPropertyValue("font-family")}`;
    return context.measureText(inputState.display).width;
  }

  async function getAutocomplete(string: string) {
    const res = await axios.get(`${API_ENDPOINT}/api/search/prefix?term=${string}`).then(res => res.data)
    let arr = []
    for (let i = 0; i < res.data.length; i++) {
      arr.push(res.data[i].term)
    }
    setAutocompletes(arr)
  }

  useEffect(() => {
    const width: number = getWidth()
    setLines(Math.floor(width / 350))
    if (inputState.input.length === 1) getAutocomplete(inputState.input); // immediate search on first letter for promptness
    setHighlighted(null)
  }, [inputState.input])

  useEffect(() => {
    if (inputState.input.length > 1) {
      getAutocomplete(inputState.input)
    }
  }, [debouncedInput])


  return (
    <div className="search-container">
      <h2>NotGPT</h2>
      <textarea
        ref={inputRef}
        value={inputState.display}
        className="search"
        placeholder="type here to search"
        onClick={() => setShowSuggestions(true)}
        onChange={(e) => inputHandler(e)}
        onKeyDown={(e) => keyHandler(e)}
        style={{height: `${45 + (lines) * 24}px`}}
      />
      <canvas ref={canvasRef} style={{display: "none"}}/>
      <AnimatePresence>
        {/*{showSuggestions && !input && <Suggestions list={trending} history={history} header={"trending"}/>}*/}
        {showSuggestions && !inputState.input &&
            <Suggestions trending={trending} history={history} searchFn={props.searchFn}/>}
        {showSuggestions && inputState.input &&
            <Suggestions trending={trending} history={history} autocompletes={autocompletes} input={inputState.input}
                         searchFn={props.searchFn}/>}
      </AnimatePresence>
    </div>
  )
}

type SuggestionsProps = {
  history?: Array<string>,
  trending?: Array<string>,
  autocompletes?: Array<string>,
  header?: string,
  input?: string
  searchFn: Function,
}


function Suggestions(props: SuggestionsProps) {
  const [selected,] = useAtom(hightlightedSuggestionAtom)
  const [count, setCount] = useAtom(suggestionsCountAtom)
  const [history, setHistory] = useAtom(historyAtom)
  const [inputState, setInputState] = useAtom(inputAtom)

  const [suggestions, setSuggestions] = useAtom(suggestionsAtom)
  const [highlighted, setHighlighted] = useAtom(hightlightedSuggestionAtom)

  function highlightInputMatch(str: string, input: string) {
    if (input.at(-1) == " ") {
      input = input.slice(0, -1)
    }
    const index = str.toLowerCase().indexOf(input.toLowerCase())
    if (index === -1) return str
    const first = str.slice(0, index)
    const second = str.slice(index, index + input.length)
    const third = str.slice(index + input.length)
    return (
      <>
        {first}
        <span className="bold">{second}</span>
        {third}
      </>
    )
  }

  // functions to check for prefix and substring matches
  function prefixExistsIn(arr: SuggestionItem[], s: string) {
    if (s.at(-1) === " ") {
      s = s.slice(0, -1)
    }
    return arr.findIndex((el) => el.text.toLowerCase() === s.toLowerCase()) > -1
  }

  function isPrefixOf(s: string, prefix: string) {
    if (prefix.at(-1) === " ") {
      prefix = prefix.slice(0, -1)
    }
    return s.toLowerCase().startsWith(prefix.toLowerCase())
  }

  function isSubstringOf(s: string, substring: string, treshold: number) {
    if (substring.at(-1) === " ") {
      substring = substring.slice(0, -1)
    }
    let i = s.toLowerCase().indexOf(substring.toLowerCase())
    if (i === 0) return true;
    return substring.length > treshold && i > 0;
  }

  function highlightSuggestion(index: number | null) {
    setHighlighted(index)
    if (index === null) {
      setInputState(prev => (
        {
          ...prev,
          display: inputState.input
        }
      ))
      return
    }
    // check for suggestion & change display if found
    let i = suggestions.findIndex(el => el.index === index)
    if (i > -1) {
      setInputState(prev => (
        {
          ...prev,
          display: suggestions[i].text
        }
      ))
    }
  }

  // Keyboard navigation
  useEventListener("keydown", (ev) => {
    switch (ev.key) {
      case "Escape":
        ev.preventDefault()
        setSuggestions([])
        highlightSuggestion(null)
        break;
      case "ArrowDown":
        ev.preventDefault()
        highlightSuggestion(selected === null || selected === count - 1 ? 0 : selected + 1)
        break;
      case "ArrowUp":
        ev.preventDefault()
        highlightSuggestion(selected === null || selected === 0 ? count - 1 : selected - 1)
        break;
      case "Enter":
        ev.preventDefault()
        if (selected === null) return;
        setInputState(prev => (
          {
            ...prev,
            input: prev.display
          }
        ))
        let i = suggestions.findIndex(el => el.index === selected)
        props.searchFn(suggestions[i].text)
        break;
    }
  })


  // compile different sources of suggestions
  useEffect(() => {
    let arr: SuggestionItem[] = []
    let count = 0

    if (!inputState.input) {
      // search history
      if (props.history && props.history.length !== 0) {
        arr.push({type: "header", text: "Search history:"})
        for (let i = 0; i < 5 && i < props.history.length; i++) {
          arr.push({type: "history", text: props.history[i], index: count++})
        }
      }
      // trending
      if (props.trending && props.trending.length !== 0) {
        arr.push({type: "header", text: "Trending:"})
        for (let i = 0; i < props.trending.length; i++) {
          arr.push({type: "trending", text: props.trending[i], index: count++})
        }
      }
    } else {
      // look for matches in history
      if (props.history && props.history.length !== 0) {
        // arr.push({type: "header", text: "Search history:"})
        let substringMatches: string[] = []
        for (let i = 0; i < props.history.length; i++) {
          // to check for prefix matches
          if (isPrefixOf(props.history[i], inputState.input)) {
            arr.push({type: "history", text: props.history[i], index: count++})
          } else {
            if (isSubstringOf(props.history[i], inputState.input, 1)) {
              substringMatches.push(props.history[i])
            }
          }
        }
        // add substring matches if there is lack of prefix matches
        if (arr.length <= 5 && substringMatches.length !== 0) {
          for (let i = 0; i < 5 && i < substringMatches.length; i++) {
            arr.push({type: "history", text: substringMatches[i], index: count++})
          }
        }
      }
      // autocomplete
      if (props.autocompletes && props.autocompletes.length !== 0) {
        for (let i = 0; i < props.autocompletes.length; i++) {
          // check for duplication with history
          if (prefixExistsIn(arr, props.autocompletes[i])) continue; // skip if found
          arr.push({type: "autocomplete", text: props.autocompletes[i], index: count++})
        }
        // add trends if there is lack of autocomplete results
        if (props.autocompletes.length <= 5 && props.trending && props.trending.length !== 0) {
          arr.push({type: "header", text: "Trending:"})
          for (let i = 0; i < props.trending.length; i++) {
            if (prefixExistsIn(arr, props.trending[i])) continue; // skip if found duplicate
            arr.push({type: "trending", text: props.trending[i], index: count++})
          }
        }
      }
    }
    setSuggestions(arr)
    setCount(count)
  }, [props.history, props.trending, props.autocompletes]);


  return (
    <motion.div
      className="suggestions-container"
      key={"suggestions-container"}
      layout
      transition={{
        duration: 0.15,
        ease: "easeOut",
        layout: {duration: 0.25, ease: "easeOut", type: "spring", stiffness: 1000, damping: 50, bounce: 100}
      }}
      initial={{opacity: 0, y: -10, scale: 1.05}}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      exit={{opacity: 0, y: -10}}
    >

      {suggestions && suggestions.map((el, i) => {
        if (el.type === "header") {
          return (
            <motion.div
              className="header"
              layout
              key={`header-${el.text}`}
              initial={{opacity: 0, y: -10, scale: 1.05}}
              animate={{
                opacity: 1, y: 0, scale: 1,
                transition: {delay: i * 0.02}
              }}
              transition={{
                layout: {duration: 0.2, ease: "easeOut", delay: 0},
              }}
            >
              {el.text} {el.text === "Search history:" ?
              <span
                className="clear-history-btn"
                onClick={() => {
                  console.log("clearing history")
                  setHistory([])
                }}>
                clear all
              </span> : ""}
            </motion.div>
          )
        } else {
          return (
            <motion.div
              className={`suggestion ${el.index === selected ? "isHighlighted" : ""}`}
              layout
              transition={{layout: {duration: 0.2, ease: "easeOut"}}}
              key={`${el.type}-${el.text}`}
              initial={{opacity: 0, y: -10, scale: 1.05}}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {delay: i * 0.02}
              }}
              exit={{opacity: 0, y: -10}}
            >
              {el.index === selected &&
                  <motion.span
                      layoutId={"selected"}
                      layout
                      className="highlighted"
                      transition={{
                        type: "spring",
                        stiffness: 450,
                        damping: 30,
                        duration: 0.5,
                      }}
                  >
                      <motion.span/>
                  </motion.span>}
              <div className="text-wrapper">
                {el.type === "history" &&
                    <span style={{fontSize: "10px", opacity: "0.3", marginRight: "7px"}}><FontAwesomeIcon
                        icon={faClock}/></span>}
                {el.type === "trending" &&
                    <span style={{fontSize: "10px", opacity: "0.3", marginRight: "7px"}}><FontAwesomeIcon
                        icon={faChartLine}/></span>}
                {props.input ? highlightInputMatch(el.text, props.input) : el.text}
              </div>

            </motion.div>
          )
        }
      })}
    </motion.div>
  )
}

export default SearchBar