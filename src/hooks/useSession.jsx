import { useContext, useEffect } from "react";
import SessionContext from "../context/SessionContext";
import useXMPP from "./useXMPP";

function useSession() {
	const { session, setSession } = useContext(SessionContext);
	const { connection, status, connect, disconnect, messages, rooms, setMessages, setRooms, joinRoom } = useXMPP();

	/**
	 *
	 * @param user String. Nombre del usuario (sin dominio).
	 * @param password String. Contraseña del usuario.
   * @param callback Función. Función de callback que se ejecuta al conectarse.
   * Devuelve como parametros (success: boolean)
	 */
	const login = async ({ user, password, callback }) => {
		const session = { user, password };

		// Cargar mensajes desde localStorage
		const key = `messages-${user}`;
		const messages = window.localStorage.getItem(key);
		if(messages){
			setMessages(JSON.parse(messages));
		}

		// Cargar rooms desde localStorage
		const keyRooms = `rooms-${user}`;
		const rooms = window.localStorage.getItem(keyRooms);
		if(rooms){
			setRooms(JSON.parse(rooms));
		}

		connect(user, password, (resStatus) => {
			console.log(resStatus, status.CONNECTED, status.AUTHFAIL);
			if (resStatus === status.CONNECTED) {
				window.localStorage.setItem("session", JSON.stringify(session));
				setSession(session);

				// Si habian rooms en memoria, unirse automaticamente
				if(rooms){
					Object.keys(JSON.parse(rooms)).forEach((room) => {
						joinRoom(room, user);
					});
				}
			}
			else if(resStatus === status.AUTHFAIL){
				setMessages({});
				setRooms({});
			}

      // Enviar status en callback
      if (callback	&& (resStatus === status.CONNECTED || resStatus === status.AUTHFAIL)) {
        callback(resStatus === status.CONNECTED );
      }
		});
	};

	/**
	 * Cierra la sesión del usuario y desconecta del servidor XMPP.
	 */
	const logout = () => {
		window.localStorage.removeItem("session");
		setSession(null);

    // Cerrar la conexión
		disconnect();
	};

	useEffect(() => {

		if(!connection || session) return;
		// Intentar cargar la sesión desde localStorage
		const ses = window.localStorage.getItem("session");
		if(!ses){
			// Si no hay sesión guardada, colocar objeto como null (no hay sesión)
			setSession(null);
			return;
		}

		const sessionData = JSON.parse(ses);

		login({ user: sessionData.user, password: sessionData.password, callback: (success) => {
			if (!success) {
				window.localStorage.removeItem("session");
				setSession(null);
			}
		}  });
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connection]);

	useEffect(() => {
		
		if(!session || !messages) return;

		// Guardar en localsotrage los mensajes
		const key = `messages-${session.user}`;
		window.localStorage.setItem(key, JSON.stringify(messages));

	}, [messages, session]);

	useEffect(() => {
		
		if(!session || !rooms) return;

		// Guardar en localsotrage los rooms
		const key = `rooms-${session.user}`;
		window.localStorage.setItem(key, JSON.stringify(rooms));

	}, [rooms, session]);

	return {
		session,
		login,
		logout,
	};
}
export default useSession;
