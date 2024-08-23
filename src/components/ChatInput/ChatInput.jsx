import PropTypes from 'prop-types';
import styles from "./ChatInput.module.css";
import { IoSend as SendIcon } from "react-icons/io5";
import { useState } from 'react';

function ChatInput({onSend}) {

  const [text, setText] = useState("");

  const handleSend = () => {
    if(text.trim().length > 0) {
      if(onSend) onSend(text);
      setText("");
    }
  }

  const handleKeyUp = (e) => {
    if(e.key === "Enter") {
      handleSend();
    }
  }
	return (
		<div className={styles.inputContainer}>
			<input
				type="text"
				className={styles.input}
				placeholder="Escribe un mensaje"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyUp={handleKeyUp}
			/>
			<button className={styles.sendButton} onClick={handleSend}>
				<SendIcon className={styles.sendIcon} />
			</button>
		</div>
	);
}

export default ChatInput;

ChatInput.propTypes = {
  onSend: PropTypes.func,
};
