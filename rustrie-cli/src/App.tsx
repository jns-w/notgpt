import './App.scss'
import {useRef, useState} from "react";
import {useOnClickOutside} from "usehooks-ts";
import SearchBar from "./components/SearchBar";

function App() {
  return (
    <div className="App">
     <SearchBar/>
    </div>
  )
}


export default App
