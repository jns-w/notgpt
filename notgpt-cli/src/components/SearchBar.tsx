import React, {useEffect, useRef, useState} from "react";
import {useDebounce, useEventListener, useIsomorphicLayoutEffect, useOnClickOutside} from "usehooks-ts";
import {AnimatePresence, motion} from "framer-motion";
import axios from "axios";

type SearchBarProps = {
  searchFn: Function,
  query: string | undefined,
}

function SearchBar(props: SearchBarProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [input, setInput] = useState("")
  const debouncedInput = useDebounce(input, 200)
  const [lines, setLines] = useState(0)

  const [trending, setTrending] = useState<Array<String>>(["trending1", "trending2 test test", "trending3"])
  const [history, setHistory] = useState<Array<String>>(["porn", "porn2"])
  const [suggestions, setSuggestions] = useState<Array<String>>([])

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Handling Clicks
  function handleClick() {
    setShowSuggestions(true)
  }

  function handleClickOutside() {
    setShowSuggestions(false)
  }

  useOnClickOutside(inputRef, handleClickOutside)

  useEventListener("keypress", (ev) => {
    if (ev.key === "Escape") {
      handleClickOutside()
    } else {
      if (ev.target === inputRef.current) {
        setShowSuggestions(true)
      }
    }
  }, inputRef)

  // Handling Typing
  function inputHandler(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    if (input.length === 0) {
      setSuggestions([])
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

  async function getSuggestions() {
    const {data} = await axios.get(`/api/search/prefix?term=${input}`).then(res => res.data)
    let arr = []
    for (let i = 0; i < data.length; i++) {
      arr.push(data[i].term)
    }
    setSuggestions(arr)
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
    if (input.length === 1) getSuggestions(); // immediate search on first letter for promptness
  }, [input])

  useEffect(() => {
    if (input) {
      getSuggestions()
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
        onClick={() => handleClick()}
        onChange={(e) => inputHandler(e)}
        onKeyDown={(e) => keyHandler(e)}
        style={{height: `${45 + (lines) * 24}px`}}
        // transition={ {height: {duration: 0.2, ease: "easeOut", type: "spring", stiffness: 1000, damping: 50, bounce: 100}}}
      />
      <canvas ref={canvasRef} style={{display: "none"}}/>
      <AnimatePresence>
        {showSuggestions && !input && <Suggestions list={trending} history={history} header={"trending"}/>}
        {showSuggestions && input && suggestions && <Suggestions list={suggestions} input={input}/>}
      </AnimatePresence>
    </div>
  )
}

type SuggestionsProps = {
  list: Array<String>,
  history?: Array<String>,
  header?: String,
  input?: String
}

function Suggestions(props: SuggestionsProps) {

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
      {props.history && props.history.length !== 0 &&
        (
          <>
            <motion.div
              className="header"
              layout
              key={"header"}
              initial={{opacity: 0, y: -10, scale: 1.05}}
              animate={{opacity: 1, y: 0, scale: 1, transition: {delay: 0}}}
            >
              History:
            </motion.div>
            {props.history.map((el, i) => {
              return (
                <motion.div
                  className="suggestion"
                  layout
                  transition={{layout: {duration: 0.2, ease: "easeOut"}}}
                  key={el}
                  initial={{opacity: 0, y: -10, scale: 1.05}}
                  animate={{opacity: 1, y: 0, scale: 1, transition: {delay: i * 0.02}}}
                >
                  {el}
                </motion.div>
              )
            })}
          </>
        )
      }


      {
        props.header && props.list.length !== 0 &&
          <motion.div
              className="header"
              layout
              key={"header"}
              initial={{opacity: 0, y: -10, scale: 1.05}}
              animate={{opacity: 1, y: 0, scale: 1, transition: {delay: 0}}}
          >
              Trending:
          </motion.div>
      }
      {
        props.list.map((el, i) => {
          return (
            <motion.div
              className="suggestion"
              layout
              transition={{layout: {duration: 0.2, ease: "easeOut"}}}
              key={el}
              initial={{opacity: 0, y: -10, scale: 1.05}}
              animate={{opacity: 1, y: 0, scale: 1, transition: {delay: i * 0.02}}}
            >

              {props.input?.length  ? highlightInputMatch(el, props.input) : el}

            </motion.div>
          )
        })
      }
    </motion.div>
  )
}

export default SearchBar