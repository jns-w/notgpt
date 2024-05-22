import {useRef, useState} from "react";
import {useEventListener, useOnClickOutside} from "usehooks-ts";
import {motion} from "framer-motion";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleXmark} from "@fortawesome/free-solid-svg-icons";

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
    <motion.div
      className="modal-wrapper"
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0}}
      transition={{duration: 0.3}}
    >
      <motion.div
        ref={ref}
        className="modal-container"
        transition={{duration: 0.3, ease: "easeOut"}}
        initial={{opacity: 0, scale: 1.1, filter: "blur(15px)"}}
        animate={{opacity: 1, scale: 1, filter: "blur(0px)"}}
        exit={{opacity: 0, scale: 1.1, filter: "blur(15px)"}}
      >
        {props.children}
        <motion.div
          className="close-modal-btn"
          initial={{opacity: 0, scale: 0.6}}
          animate={{opacity: 1, scale: 1,
            transition: {duration: 0.3, delay: 0.35, type: "spring", stiffness: 260}
          }}
          transition={{delay: 0}}
        >
          <FontAwesomeIcon icon={faCircleXmark} onClick={() => closeModal()} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
