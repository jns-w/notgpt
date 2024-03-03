import './App.scss'
import "@fontsource/inter"
import "@fontsource/inter/800.css"
import SearchBar from "./components/SearchBar";
import {Modal} from "./components/Modal";
import {Suspense, useState} from "react";
import axios from "axios";
import {useIsomorphicLayoutEffect} from "usehooks-ts";
import {AnimatePresence} from "framer-motion";
import {useAtom} from 'jotai';
import {historyAtom} from "./atoms/searchbar";

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || "https://notgpt-server.capybara.wldspace.com"

type Params = {
  [key: string]: string
}

function App() {
  const [resultsModal, setResultsModal] = useState(false)
  const [params, setParams] = useState<Params>({})
  const [history, setHistory] = useAtom(historyAtom)
  const [searchResult, setSearchResult] = useState({} as any)

  async function search(input: string) {
    setResultsModal(true)
    const response = await axios.get(`${API_ENDPOINT}/api/search?term=${input}`)
      .then(r => r.data)
    console.log("response:", response)
    // update search history
    setSearchResult(response.data)
    updateHistory(input.toLowerCase())
  }

  function updateHistory(input: string) {
    if (!input) return;
    if (history.includes(input)) {
      let arr = history.filter((item) => item !== input)
      arr.unshift(input)
      // arr.slice(0, 4)
      setHistory(arr)
    } else {
      // let arr = history.slice(0, 3)
      let arr = history
      arr.unshift(input)
      setHistory(arr)
    }
  }

  useIsomorphicLayoutEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const paramsObj: Params = {}
    for (let [k, v] of searchParams.entries()) {
      paramsObj[k] = v
    }
    setParams(paramsObj)
  }, [])

  return (
    <div className="App">
      <SearchBar searchFn={search} query={params.q || undefined}/>
      <AnimatePresence>
        {resultsModal && (
          <ResultsModal isMounted={resultsModal} setMount={setResultsModal} searchResult={searchResult}/>
        )}
      </AnimatePresence>
    </div>
  )
}

type ResultsModalProps = {
  searchString?: String,
  setMount: Function,
  isMounted: Boolean,
  searchResult: any,
}

function ResultsModal(props: ResultsModalProps) {
  const [results, setResults] = useState({})

  return (
    <Modal setMount={props.setMount}>
      <Suspense fallback={<Loading/>}>
        <div className="results-container">
          <h2>
            Results for "{props.searchResult.term}"
          </h2>
          <div className="results-content">
            <p>
              This term has been searched a total of {props.searchResult.weight} times.
            </p>
          </div>
        </div>
      </Suspense>
    </Modal>
  )
}

function Loading() {
  return (
    <div>Loader</div>
  )
}

export default App
