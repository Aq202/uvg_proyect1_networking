import { useContext } from "react";
import XMPPContext from "../context/XMPPContext";
import { Strophe, $pres, $msg } from "strophe.js";
import consts from "../utils/consts";

const useXMPP = () => {
	const connection = useContext(XMPPContext);
	if (connection === undefined) {
		throw new Error("useXMPP debe ser utilizado dentro de un XMPPProvider");
	}

	const status = {
		CONNECTING: Strophe.Status.CONNECTING,
		CONNECTED: Strophe.Status.CONNECTED,
		DISCONNECTED: Strophe.Status.DISCONNECTED,
		DISCONNECTING: Strophe.Status.DISCONNECTING,
		ATTACHED: Strophe.Status.ATTACHED,
		AUTHFAIL: Strophe.Status.AUTHFAIL,
		ERROR: Strophe.Status.ERROR,
		CONNFAIL: Strophe.Status.CONNFAIL,
		REDIRECT: Strophe.Status.REDIRECT,
	};

	const sendPresence = () => {
		const presence = $pres({
			type: "available",
		});
		connection.send(presence);
	};

	const onMessage = (msg) => {
		const from = msg.getAttribute("from");
		const body = msg.getElementsByTagName("body")[0].textContent;

		console.log("Mensaje recibido de " + from + ": " + body);

		return true; // Mantener el handler activo
	};

	const connect = (user, password, callback) => {

		connection.connect(`${user}@${consts.serverDomain}/${consts.connectionResource}`, password, (resStatus) => {
			if (resStatus === status.CONNECTED) {
				connection.addHandler(onMessage, null, "message", "chat", null); // Escuchar mensajes
				sendPresence();
			}

			if (callback) callback(resStatus);
		});
	};

	const disconnect = () => {
		connection.disconnect();
	};

	const sendMessage = (to, message) => {

		const msg = $msg({
			to: `${to}@${consts.serverDomain}/${consts.connectionResource}`,
			from: connection.jid,
			type: "chat",
		})
			.c("body")
			.t(message);

		// Enviar el mensaje
		connection.send(msg);
	};

	return {
		status,
		connection,
		connect,
		disconnect,
		sendPresence,
		sendMessage,
	};
};

export default useXMPP;
