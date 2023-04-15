import {useEffect, useRef, useState} from "react";
import {useDebounce, useOnClickOutside} from "usehooks-ts";
import axios from "axios";

function SearchBar() {
  const [clicked, setClicked] = useState(false)
  const [input, setInput] = useState("")
  const debouncedInput = useDebounce(input, 100)

  const [lines, setLines] = useState(0)
  const [textWidth, setTextWidth] = useState(0)

  const [trending, setTrending] = useState<Array<String>>([])
  const [suggestions, setSuggestions] = useState<Array<String>>([])

  const inputRef = useRef(null);
  const canvasRef = useRef();


  // Handling Clicks
  function handleClick() {
    setClicked(true)
  }

  function handleClickOutside() {
    setClicked(false)
  }

  useOnClickOutside(inputRef, handleClickOutside)

  // Handling Typing
  function inputHandler(e) {
    setInput(e.target.value)
    if (input.length === 0) {
      setSuggestions([])
    }
  }

  function keyHandler(e) {
    if (e.key === "Enter") {
      e.preventDefault()
      search()
    }
  }

  // Handling multi-line search terms
  // we check for length of typed text
  function getWidth() {
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    const inputStyles = window.getComputedStyle(inputRef.current);
    context.font = `${inputStyles.getPropertyValue("font-weight")} ${inputStyles.getPropertyValue("font-size")} ${inputStyles.getPropertyValue("font-family")}`;
    return context.measureText(input).width;
  }

  async function getTrending() {
    const {data} = await axios.get('/api/trending').then(res => res.data)
    setTrending(data)
  }

  async function getSuggestions() {
    const {data} = await axios.get(`/api/search/prefix?term=${input}`).then(res => res.data)
    let arr = []
    for (let i = 0; i < data.length;  i++) {
      arr.push(data[i].term)
    }
    setSuggestions(arr)
  }

  async function search() {
    const res = await axios.get(`/api/search?term=${input}`)
    console.log(res)
  }

  useEffect(() => {
    getTrending()
  }, [])

  useEffect(() => {
    setLines(Math.floor(getWidth()/350))
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
      {clicked && !input && <Suggestions list={trending}/>}
      {input && suggestions && <Suggestions list={suggestions}/>}
    </div>
  )
}

type SuggestionsProps = {
  list: Array<String>
}

function Suggestions(props: SuggestionsProps) {
  return (
    <div className="suggestions-container">
      {props.list.map(el => <div key={el}>
        {el}
      </div>)}
    </div>
  )
}

export default SearchBar