import React, {useEffect, useRef, useState} from "react";
import {useDebounce, useIsomorphicLayoutEffect, useOnClickOutside} from "usehooks-ts";
import axios from "axios";

type SearchBarProps = {
  searchFn: Function,
  query: string | undefined,
}

function SearchBar(props: SearchBarProps) {
  const [clicked, setClicked] = useState(false)
  const [input, setInput] = useState("")
  const debouncedInput = useDebounce(input, 200)

  const [lines, setLines] = useState(0)

  const [trending, setTrending] = useState<Array<String>>(["trending1", "trending2 test test", "trending3"])
  const [suggestions, setSuggestions] = useState<Array<String>>([])

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Handling Clicks
  function handleClick() {
    setClicked(true)
  }

  function handleClickOutside() {
    setClicked(false)
  }

  useOnClickOutside(inputRef, handleClickOutside)

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
    for (let i = 0; i < data.length;  i++) {
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
    setLines(Math.floor(width/350))
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
        style={{height: `${45+(lines)*24}px`}}
      />
       <canvas ref={canvasRef} style={{display: "none"}}/>
      {clicked && !input && <Suggestions list={trending} header={"trending"}/>}
      {input && suggestions && <Suggestions list={suggestions}/>}
    </div>
  )
}

type SuggestionsProps = {
  list: Array<String>
  header?: String
}

function Suggestions(p: SuggestionsProps) {
  console.log(p.list)
  return (
    <div className="suggestions-container">
      {p.header && p.list.length !== 0 &&
        <div className="header">
          Trending:
        </div>}

      {p.list.map((el, i) => <div className="suggestion" key={i}>
        {el}
      </div>)}
    </div>
  )
}

export default SearchBar