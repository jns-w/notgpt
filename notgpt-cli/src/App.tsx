import './App.scss'
import "@fontsource/inter"
import "@fontsource/inter/800.css"
import SearchBar from "./components/SearchBar";
import {Modal} from "./components/Modal";
import {Suspense, useEffect, useState} from "react";
import axios from "axios";
import {useIsomorphicLayoutEffect} from "usehooks-ts";
import {AnimatePresence} from "framer-motion";
import {useAtom} from 'jotai';
import {historyAtom} from "./atoms/searchbar";

type Params = {
  [key: string]: string
}

function App() {
  const [resultsModal, setResultsModal] = useState(false)
  const [params, setParams] = useState<Params>({})
  const [history, setHistory] = useAtom(historyAtom)

  async function search(input: string) {
    setResultsModal(true)
    const response = await axios.get(`/api/search?term=${input}`)
      .then(r => r.data)
    console.log(response)
    // update search history
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
          <ResultsModal isMounted={resultsModal} searchString={""} setMount={setResultsModal}/>
        )}
      </AnimatePresence>
    </div>
  )
}

type ResultsModalProps = {
  searchString: String,
  setMount: Function,
  isMounted: Boolean,
}

function ResultsModal(props: ResultsModalProps) {
  const [results, setResults] = useState({})

  async function search() {
    const response = await axios.get(`/api/search?term=${props.searchString}`)
      .then(r => r.data);
    console.log(response)
  }

  useIsomorphicLayoutEffect(() => {
    search()
  }, [props.searchString])

  return (
    <>
      <Modal setMount={props.setMount}>
        <Suspense fallback={<Loading/>}>
          Search Results for {props.searchString}
        </Suspense>
      </Modal>
    </>
  )
}

function Loading() {
  return (
    <div>Loader</div>
  )
}

export default App
