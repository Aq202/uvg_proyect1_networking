import PropTypes from "prop-types";
import ChatInput from "../ChatInput/ChatInput";
import Message from "../Message/Message";
import styles from "./SingleChat.module.css";
import useXMPP from "../../hooks/useXMPP";
import { scrollbarGray } from "../../styles/scrollbar.module.css";
import { useEffect, useRef, useState } from "react";
import AddContactButton from "../AddContactButton/AddContactButton";

function SingleChat({ user }) {
	const {
		messages,
		roster,
		subscriptionRequests,
		sendMessage,
		sendViewedConfirmation,
		addContact,
		acceptSubscription,
		getUploadUrl,
	} = useXMPP();

  const [firstOpen, setFirstOpen] = useState(true);

	const chatContainerRef = useRef();
  const lastChildRef = useRef();

  const scrollToBottom = () => {
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }

	const handleSend = (text) => {
    scrollToBottom(); // Al mandar mensaje, scroll al final obligatorio
		sendMessage(user, text);
	};

	const handleSendFile = (file) => {
		if (file) {
			getUploadUrl({ filename: file.name, size: file.size, contentType: file.type }).then((url) => {
				fetch(url, {
					method: "PUT",
					body: file,
				}).then(() => {
					
					// Enviar url por mensaje
					handleSend(url);

				});
			});
		}
	};

	const handleAddContactClick = () => {
		const res = confirm(`¿Desea agregar a ${user} a tus contactos?`);
		if (res) {
			const nickname = prompt("Ingrese un apodo para este contacto");
			if(nickname){

				// Agregar usuario o aceptar solicitud según corresponda
				if(subscriptionRequests.includes(user)) acceptSubscription(user, nickname);
				else addContact(user, nickname);
			}
		}
	}

  useEffect(() => {
    // Enviar al abrir al chat
    sendViewedConfirmation(user);
  }, []);

	useEffect(() => {

    if (chatContainerRef.current && lastChildRef.current) {

      if(firstOpen){
        // Si es la primera vez que se abre el chat, hacer scroll al final
        scrollToBottom();
        setFirstOpen(false);
      }

      // Cuando se recibe un mensaje, verificar si el último mensaje es visible
      // si lo es, hacer scroll al final

      const { scrollTop, clientHeight} = chatContainerRef.current;
      const lastChildOffsetTop = lastChildRef.current.offsetTop;

      if (scrollTop + clientHeight >= lastChildOffsetTop - 100) {
        scrollToBottom();
      }
    }
	}, [messages[user]]);

	return (
		<div
			className={styles.chat}
			onClick={() => sendViewedConfirmation(user)}
			onFocus={() => sendViewedConfirmation(user)}
		>
			<header className={styles.chatHeader}>
				<h3 className={styles.title}>{user}</h3>
				{!roster[user] && (
					<AddContactButton
						className={styles.addContactButton}
						title={`Agregar a ${user} a contactos`}
						onClick={handleAddContactClick}
					/>
				)}
			</header>
			<div
				className={`${styles.chatsContainer} ${scrollbarGray}`}
				ref={chatContainerRef}
			>
				<ul className={styles.messagesList}>
					{messages[user] &&
						messages[user].map((message, index) => {
							const firstMessage = index === 0 || messages[user][index - 1].sent !== message.sent;
							return (
								<Message
									key={index}
									left={!message.sent}
									message={message.message}
									date={message.date.toString()}
									viewed={message.viewed}
									showTriangle={firstMessage}
									refObj={index === messages[user].length - 1 ? lastChildRef : null}
								/>
							);
						})}
				</ul>
			</div>
			<ChatInput
				onSend={handleSend}
				onKeyUp={() => sendViewedConfirmation(user)}
				onFileSend={handleSendFile}
			/>
		</div>
	);
}

export default SingleChat;

SingleChat.propTypes = {
	user: PropTypes.string.isRequired,
};
