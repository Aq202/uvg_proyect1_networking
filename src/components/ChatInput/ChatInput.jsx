import { useRef, useState } from "react";
import PropTypes from "prop-types";
import styles from "./ChatInput.module.css";
import { IoSend as SendIcon } from "react-icons/io5";
import { MdAttachFile as AttachFileIcon } from "react-icons/md";
import { IoClose as CloseIcon } from "react-icons/io5";

function ChatInput({ onSend=null, onFileSend=null, onKeyUp=null}) {
	const [text, setText] = useState("");
	const [file, setFile] = useState();

  const fileInputRef = useRef(null);
  
	const handleSend = () => {

    if(file){
      if(onFileSend) onFileSend(file);
      clearFile();
    }
		if (text.trim().length > 0) {
			if (onSend) onSend(text);
			setText("");
		}
	};

	const handleKeyUp = (e) => {
		if (e.key === "Enter") {
			handleSend();
		}
		if (onKeyUp) onKeyUp(e);
	};

	const handleFileChange = (e) => {
		setFile(e.target.files[0]);
		setText("");
	};

  const clearFile = () => {
    setFile(null);
    setText("");
    fileInputRef.current.value = "";
  }

	return (
		<div className={styles.inputContainer}>
			<label
				className={styles.button}
				onClick={handleSend}
        htmlFor="fileInput"
			>
				<AttachFileIcon />
				<input
          id="fileInput"
					type="file"
					className={styles.inputFile}
					onChange={handleFileChange}
          ref={fileInputRef}
				/>
			</label>

			{!file && (
				<>
					<input
						type="text"
						className={styles.input}
						placeholder="Escribe un mensaje"
						value={text}
						onChange={(e) => setText(e.target.value)}
						onKeyUp={handleKeyUp}
					/>
				</>
			)}

			{file && (
				<>
					<button
						className={`${styles.button} ${styles.cancelFileButton}`}
						onClick={clearFile}
					>
						<CloseIcon />
					</button>
					<span className={styles.fileName}>{file.name}</span>
				</>
			)}

			<button
				className={styles.button}
				onClick={handleSend}
			>
				<SendIcon />
			</button>
		</div>
	);
}

export default ChatInput;

ChatInput.propTypes = {
	onSend: PropTypes.func,
	onKeyUp: PropTypes.func,
  onFileSend: PropTypes.func,
};
