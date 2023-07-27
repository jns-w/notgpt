import React, {useEffect, useRef, useState} from "react";
import {useDebounce, useEventListener, useIsomorphicLayoutEffect, useOnClickOutside} from "usehooks-ts";
import {AnimatePresence, motion} from "framer-motion";
import axios from "axios";
import {useAtom} from "jotai";
import {historyAtom, selectedSuggestionAtom, suggestionsCountAtom} from "../atoms/searchbar";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleLeft, faChartLine} from "@fortawesome/free-solid-svg-icons";
import {faClock} from "@fortawesome/free-regular-svg-icons";

type SearchBarProps = {
  searchFn: Function,
  query: string | undefined,
}

function SearchBar(props: SearchBarProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [input, setInput] = useState("")
  const debouncedInput = useDebounce(input, 200)
  const [lines, setLines] = useState(0)
  const [selected, setSelected] = useAtom(selectedSuggestionAtom)
  const [suggestionsCount, setSuggestionsCount] = useAtom(suggestionsCountAtom)

  const [trending, setTrending] = useState<Array<String>>(["trending1", "trending2 test test", "trending3"])
  const [history, setHistory] = useAtom(historyAtom)
  const [autocompletes, setAutocompletes] = useState<Array<String>>([]
  )

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useOnClickOutside(inputRef, () => {
    setShowSuggestions(false)
    setSelected(null)
  })

  useEventListener("keypress", (ev) => {
    if (ev.key === "Escape") {
      setShowSuggestions(false)
      setSelected(null)
    } else {
      if (ev.target === inputRef.current) {
        setShowSuggestions(true)
      }
    }
  }, inputRef)

  useEventListener("keydown", (ev) => {
    switch (ev.key) {
      case "ArrowDown":
        ev.preventDefault()
        if (selected === suggestionsCount - 1) {
          setSelected(null)
          break;
        } else {
          setSelected(selected === null ? 0 : selected + 1)
        }
        break;
      case "ArrowUp":
        ev.preventDefault()
        if (selected === 0) {
          setSelected(null)
          break;
        } else {
          setSelected(selected === null ? autocompletes.length - 1 : selected - 1)
        }
        break;
    }
  }, inputRef)

  // Handling Typing
  function inputHandler(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    setSelected(null)
    if (input.length === 0) {
      setAutocompletes([])
    }
  }

  function keyHandler(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      if (!input) return;
      props.searchFn(input)
    }
  }

  // Handling multi-line search terms
  // we check for length of typed text
  function getWidth(): number {
    const canvas: HTMLCanvasElement = canvasRef.current!
    const context = canvas.getContext("2d") as CanvasRenderingContext2D
    const inputStyles: CSSStyleDeclaration = window.getComputedStyle(inputRef.current!);
    context.font = `${inputStyles.getPropertyValue("font-weight")} ${inputStyles.getPropertyValue("font-size")} ${inputStyles.getPropertyValue("font-family")}`;
    return context.measureText(input).width;
  }

  async function getTrending() {
    const {data} = await axios.get('/api/trending').then(res => res.data)
    // setTrending(data)
  }

  async function getAutocomplete() {
    const {data} = await axios.get(`/api/search/prefix?term=${input}`).then(res => res.data)
    let arr = []
    for (let i = 0; i < data.length; i++) {
      arr.push(data[i].term)
    }
    setAutocompletes(arr)
  }

  useIsomorphicLayoutEffect(() => {
    getTrending()
    if (props.query) {
      setInput(props.query)
    }
  }, [])


  useEffect(() => {
    const width: number = getWidth()
    setLines(Math.floor(width / 350))
    if (input.length === 1) getAutocomplete(); // immediate search on first letter for promptness
  }, [input])

  useEffect(() => {
    if (input) {
      getAutocomplete()
    }
  }, [debouncedInput])


  return (
    <div className="search-container">
      <h2>NotGPT</h2>
      <textarea
        ref={inputRef}
        value={input}
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
        {showSuggestions && !input && <Suggestions trending={trending} history={history}/>}
        {showSuggestions && input &&
            <Suggestions trending={trending} history={history} autocompletes={autocompletes} input={input}/>}
      </AnimatePresence>
    </div>
  )
}

type SuggestionsProps = {
  history?: Array<String>,
  trending?: Array<String>,
  autocompletes?: Array<String>,
  header?: String,
  input?: String
}

type SuggestionItem = {
  type: "header" | "history" | "trending" | "autocomplete",
  text: String,
  index?: number
}

function Suggestions(props: SuggestionsProps) {
  const [selected,] = useAtom(selectedSuggestionAtom)
  const [count, setCount] = useAtom(suggestionsCountAtom)
  const [history, setHistory] = useAtom(historyAtom)

  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])

  function highlightInputMatch(str: String, input: String) {
    const index = str.toLowerCase().indexOf(input.toLowerCase())
    if (index === -1) return str
    const first = str.slice(0, index)
    const second = str.slice(index, index + input.length)
    const third = str.slice(index + input.length)
    return (
      <>
        {first}
        <span className="highlight">{second}</span>
        {third}
      </>
    )
  }

  // compile different sources of suggestions
  useEffect(() => {
    let arr: SuggestionItem[] = []
    let count = 0

    if (!props.input) {
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
        for (let i = 0; i < props.history.length; i++) {
          if (props.history[i].toLowerCase().startsWith(props.input.toLowerCase())) {
            arr.push({type: "history", text: props.history[i], index: count++})
          }
        }
      }
      // autocomplete
      if (props.autocompletes && props.autocompletes.length !== 0) {
        for (let i = 0; i < props.autocompletes.length; i++) {
          // check for duplication with history
          if (arr.findIndex((el) => el.text === props.autocompletes![i]) > -1) continue; // skip if found
          arr.push({type: "autocomplete", text: props.autocompletes[i], index: count++})
        }

        // add trends if there is lack of autocomplete results
        if (props.autocompletes.length <= 5 && props.trending && props.trending.length !== 0) {
          arr.push({type: "header", text: "Trending:"})
          for (let i = 0; i < props.trending.length; i++) {
            if (arr.findIndex((el) => el.text === props.trending![i]) > -1) continue; // skip if found duplicate
            arr.push({type: "trending", text: props.trending[i], index: count++})
          }
        }
      }

    }


    setSuggestions(arr)


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
              // key={`header-${el.text}`}
              initial={{opacity: 0, y: -10, scale: 1.05}}
              animate={{opacity: 1, y: 0, scale: 1, transition: {delay: i * 0.02}}}
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
              className={`suggestion`}
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
              <div className="text-wrapper">
                {el.type === "history" &&
                    <span style={{fontSize: "10px", opacity: "0.3", marginRight: "7px"}}><FontAwesomeIcon
                        icon={faClock}/></span>}
                {el.type === "trending" &&
                    <span style={{fontSize: "10px", opacity: "0.3", marginRight: "7px"}}><FontAwesomeIcon
                        icon={faChartLine}/></span>}
                {props.input ? highlightInputMatch(el.text, props.input) : el.text}
              </div>
              {el.index === selected &&
                  <motion.span
                      layoutId={"selected"}
                      layout
                      className="selected"
                      transition={{type: "spring", stiffness: 450, damping: 30, duration: 0.2}}
                      initial={{opacity: .5, x: 20, scale: 1.05}}
                      animate={{opacity: 1, x: 0, scale: 1}}
                      exit={{opacity: 0, x: 20}}
                  >
                      <FontAwesomeIcon icon={faAngleLeft}/>
                  </motion.span>}
            </motion.div>
          )
        }
      })}
    </motion.div>
  )
}

export default SearchBar