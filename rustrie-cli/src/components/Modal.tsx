import {useState, useRef, useEffect} from "react";
import {wait} from "../utils";
import {useEventListener, useOnClickOutside} from "usehooks-ts";

type ModalProps = {
  setMount: Function,
  header?: String,
  children: any
}

export const Modal = (props: ModalProps) => {
  const [vis, setVis] = useState(false)
  const ref = useRef(null)

  async function closeModal() {
    setVis(false)
    await wait(250)
    props.setMount(false)
  }

  useEffect(() => {
    setVis(true)
  }, [])

  useOnClickOutside(ref, closeModal)

  useEventListener('keypress', (ev) => {
    if (ev.key === "Escape") {
      closeModal()
    }
  })

  return (
    <div className="modal-wrapper">
      <div>
        {props.children}
      </div>
    </div>
  )

}