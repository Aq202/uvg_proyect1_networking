import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import useXMPP from "../../hooks/useXMPP";
import AddButton from "../AddButton/AddButton";
import ChatItem from "../ChatItem/ChatItem";
import styles from "./ChatRoomsList.module.css";
import { scrollbarGray } from "../../styles/scrollbar.module.css";
import useSession from "../../hooks/useSession";

/**
 * Componente que muestra una lista de salas de chat y permite unirse a nuevas salas y seleccionar salas existentes.
 * 
 * @param {Object} props - Las propiedades del componente.
 * @param {Function} [props.onSelectedRoomChange] - Función que se llama cuando la sala seleccionada cambia, proporcionando la sala seleccionada como argumento.
 */
function ChatRoomsList({ onSelectedRoomChange = null }) {
	const { session } = useSession();
	const { rooms, joinRoom } = useXMPP();
	const [selectedRoom, setSelectedRoom] = useState(null);

	useEffect(() => {
		if (onSelectedRoomChange) onSelectedRoomChange(selectedRoom);
	}, [selectedRoom]);

	const handleJoinRoom = () => {
		const room = prompt("Ingrese el nombre del grupo al que desea unirse:");
		if (!room) return;
		joinRoom(room, session.user);
	};
	return (
		<div className={styles.roomsList}>
			<header>
				<h1 className={styles.title}>Grupos</h1>
				<AddButton onClick={handleJoinRoom} />
			</header>

			<ul className={`${styles.listContainer} ${scrollbarGray}`}>
				{Object.entries(rooms)
					.sort((room1, room2) => {
						const [roomName1, roomData1] = room1;
						const [roomName2, roomData2] = room2;

						// Ordenar por fecha del último mensaje (chats nuevos van al inicio)
						const lastMessage1 = roomData1.messages.slice(-1)[0];
						const lastMessage2 = roomData2.messages.slice(-1)[0];
						if (!lastMessage1 && !lastMessage2) return roomName1 < roomName2 ? -1 : 1; // Si no hay mensajes, ordenar por nombre
						if (!lastMessage1) return -1; // Mantener los chats sin mensajes al inicio
						if (!lastMessage2) return -1;
						return lastMessage2.date - lastMessage1.date; // Ordenar por fecha del último mensaje
					})
					.map((roomData) => {
						const [room, { messages }] = roomData;

						const lastMessage = messages.slice(-1)[0];
						const lastMessageText = lastMessage
							? 
              `${lastMessage.nickname === session.user ? "Tú" : lastMessage.nickname}: ${lastMessage.message}`
							: null;
						const notViewdMessages = messages.filter(
							(message) => !message.viewed && message.nickname !== session.user
						).length;

						return (
							<ChatItem
								key={room}
								user={room}
								message={lastMessageText}
								date={lastMessage?.date?.toString()}
								onClick={setSelectedRoom}
								selected={selectedRoom === room}
								notViewed={notViewdMessages}
							/>
						);
					})}
			</ul>
		</div>
	);
}

export default ChatRoomsList;

ChatRoomsList.propTypes = {
	onSelectedRoomChange: PropTypes.func,
};
