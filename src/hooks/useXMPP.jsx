import { useContext } from "react";
import XMPPContext from "../context/XMPPContext";
import { Strophe, $pres, $msg, $iq } from "strophe.js";
import consts from "../utils/consts";

const useXMPP = () => {

	const {connection,subscriptionRequests, setSubscriptionRequests } = useContext(XMPPContext);


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
		connection.connect(
			`${user}@${consts.serverDomain}/${consts.connectionResource}`,
			password,
			(resStatus) => {
				if (resStatus === status.CONNECTED) {
					connection.addHandler(onMessage, null, "message", "chat", null); // Escuchar mensajes
					connection.addHandler(handleSubscriptionRequest, null, "presence", "subscribe"); // Escuchar solicitudes de suscripción
					sendPresence();
				}

				if (callback) callback(resStatus);
			}
		);
	};

	const disconnect = () => {
		connection.disconnect();

		// Limpiar variables
		setSubscriptionRequests([]);
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

	const getRoster = () => {
		const iq = $iq({
			type: "get",
			xmlns: "jabber:client",
		}).c("query", { xmlns: "jabber:iq:roster" });

		connection.sendIQ(
			iq,
			function (response) {
				console.log("Lista de contactos obtenida:", response);
				handleRoster(response);
			},
			function (error) {
				console.error("Error al obtener lista de contactos:", error);
			}
		);
	};

	const handleRoster = (response) => {
		const items = response.getElementsByTagName("item");
		const contacts = [];

		for (let i = 0; i < items.length; i++) {
			const jid = items[i].getAttribute("jid");
			const name = items[i].getAttribute("name");
			const subscription = items[i].getAttribute("subscription");
			contacts.push({ jid, name, subscription });
		}

		console.log("Contactos:", contacts);
	};

	const addContactToRoster = (jid, name) =>
		new Promise((resolve, reject) => {
			const iq = $iq({
				type: "set",
				xmlns: "jabber:client",
			})
				.c("query", { xmlns: "jabber:iq:roster" })
				.c("item", {
					jid,
					name,
					subscription: "both",
				});

			connection.sendIQ(iq, resolve, reject);
		});

	const addContact = (user, alias) => {
		const jid = `${user}@${consts.serverDomain}`;
		addContactToRoster(jid, alias).then(() => {
			connection.send($pres({ to: jid, type: "subscribe" }));
		});
	};

	const acceptSubscription = (jid, alias) => {
		addContactToRoster(jid, alias).then(() => {
			connection.send($pres({ to: jid, type: "subscribed" }));

			// Eliminar de la lista de solicitudes
			setSubscriptionRequests((prev) => prev.filter((user) => user !== jid));
		});
	};

	function handleSubscriptionRequest(presence) {
		const senderJid = Strophe.getBareJidFromJid(presence.getAttribute("from"));

		// Agregar a la lista de solicitudes
		setSubscriptionRequests((prev) => [...prev, senderJid]);

		return true; // Continúa escuchando otros mensajes
	}


	return {
		status,
		connection,
		subscriptionRequests,
		connect,
		disconnect,
		sendPresence,
		sendMessage,
		getRoster,
		addContact,
		acceptSubscription,
	};
};

export default useXMPP;
