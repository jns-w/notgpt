import './App.scss'
import "@fontsource/inter"
import "@fontsource/inter/800.css"
import SearchBar from "./components/SearchBar";
import {Modal} from "./components/Modal";
import {useState} from "react";
import axios from "axios";

function App() {
  const [results, setResults] = useState({});

  async function search(input: String) {
    const res = await axios.get(`/api/search?term=${input}`)
    console.log(res)
  }

  return (
    <div className="App">
      <SearchBar searchFn={search}/>
      <ResultsModal results={results}/>
    </div>
  )
}

type ResultsModalProps = {
  results: any
}

function ResultsModal(props: ResultsModalProps) {
  const [mount, setMount] = useState(false);

  if (mount) {
    return (
      <Modal setMount={setMount}>
        Search results
      </Modal>
    )
  } else {
    return <></>
  }
}

export default App
