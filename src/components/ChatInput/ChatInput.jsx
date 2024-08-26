import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import styles from "./ChatInput.module.css";
import { IoSend as SendIcon } from "react-icons/io5";
import { MdAttachFile as AttachFileIcon } from "react-icons/md";
import { IoClose as CloseIcon } from "react-icons/io5";

/**
 * Componente de entrada de chat que permite al usuario escribir mensajes y adjuntar archivos.
 *
 * Este componente incluye un campo de texto para mensajes, un botón para adjuntar archivos, y un botón para enviar el mensaje.
 * Muestra el nombre del archivo adjunto y permite cancelarlo.
 *
 * @param {Object} props - Las propiedades del componente.
 * @param {Function} [props.onSend] - Función a ejecutar cuando se envía un mensaje de texto.
 * @param {Function} [props.onFileSend] - Función a ejecutar cuando se envía un archivo.
 * @param {Function} [props.onKeyUp] - Función a ejecutar en el evento `onKeyUp` del campo de texto.
 */
function ChatInput({ onSend=null, onFileSend=null, onKeyUp=null}) {
	const [text, setText] = useState("");
	const [file, setFile] = useState();

  const fileInputRef = useRef(null);
	const textInputRef = useRef(null);
  
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

	useEffect(() => {
		textInputRef.current.focus();
	}, []);

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
						ref={textInputRef}
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
