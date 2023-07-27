import './App.scss'
import "@fontsource/inter"
import "@fontsource/inter/800.css"
import SearchBar from "./components/SearchBar";
import {Modal} from "./components/Modal";
import {Suspense, useState} from "react";
import axios from "axios";
import {useIsomorphicLayoutEffect} from "usehooks-ts";
import {AnimatePresence} from "framer-motion";

type Params = {
  [key: string]: string
}

function App() {
  const [resultsModal, setResultsModal] = useState(false)
  const [params, setParams] = useState<Params>({})

  async function search(input: String) {
    setResultsModal(true)
    const response = await axios.get(`/api/search?term=${input}`)
      .then(r => r.data)
    console.log(response)
    // update search history
    window.localStorage.setItem("NGPT_HIST", JSON.stringify([input, ...JSON.parse(window.localStorage.getItem("NGPT_HIST") || "[]")]))
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
