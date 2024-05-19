import {useRef, useState} from "react";
import {useEventListener, useOnClickOutside} from "usehooks-ts";
import {motion} from "framer-motion";

type ModalProps = {
  setMount: Function,
  header?: String,
  children: any,
};

export const Modal = (props: ModalProps) => {
  const [vis, setVis] = useState(false)
  const ref = useRef(null)

  async function closeModal() {
    props.setMount(false)
  }

  useOnClickOutside(ref, closeModal)

  useEventListener("keydown", (ev) => {
    switch (ev.key) {
      case "Escape":
        closeModal()
        break;
    }
  });

  return (
    <div className="modal-wrapper">
      <motion.div
        ref={ref}
        className="modal-container"
        transition={{duration: 0.2, ease: "easeOut"}}
        initial={{opacity: 0, y: -15, scale: 1.05}}
        animate={{opacity: 1, y: 0, scale: 1}}
        exit={{opacity: 0, y: -15, scale: 1.05}}
      >
        {props.children}
      </motion.div>
    </div>
  );
};
