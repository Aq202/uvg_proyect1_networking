import { useContext } from "react";
import XMPPContext from "../context/XMPPContext";
import { Strophe, $pres, $msg, $iq } from "strophe.js";
import consts from "../utils/consts";

const useXMPP = () => {

	const { connection, subscriptionRequests, setSubscriptionRequests, setUserStates } = useContext(XMPPContext);


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

	const presenceShowValues = {
		AVAILABLE: "chat",
		AWAY: "away",
		DND: "dnd",
		XA: "xa",
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
					connection.addHandler(onPresence, null, 'presence'); // Escuchar presencia
					
					connection.send($pres({})); // Enviar presence con status 'disponible'
				}

				if (callback) callback(resStatus);
			}
		);
	};

	const disconnect = () => {
		//Enviar presence de status de desconexión
		connection.send($pres({ type: 'unavailable' }));
		
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

	const onPresence = (presence) => {
    const from = presence.getAttribute('from');
    const type = presence.getAttribute('type');

		const user = from.split('@')[0]; // Obtener solo el nombre de usuario
		const userStatus = {};

		userStatus.available = type !== 'unavailable';

		if(userStatus.available){
			userStatus.show = Strophe.getText(presence.getElementsByTagName('show')[0]);
      userStatus.status = Strophe.getText(presence.getElementsByTagName('status')[0]);
		}

		// Guardar datos del estado del usuario
		setUserStates((prev) => ({ ...prev, [user]: userStatus }));

    return true;
	}

	const changeState = (show, status) => {
		connection.send($pres()
    .c('show').t(show)
    .up()
    .c('status').t(status)
		);
	}

	const deleteAccount = () => new Promise((resolve, reject) => {
		const iq = $iq({ type: "set", to: connection.domain })
			.c("query", { xmlns: "jabber:iq:register" })
			.c("remove");

		connection.sendIQ(iq, resolve, reject);
	});

	return {
		status,
		connection,
		subscriptionRequests,
		presenceShowValues,
		connect,
		disconnect,
		sendMessage,
		getRoster,
		addContact,
		acceptSubscription,
		changeState,
		deleteAccount,
	};
};

export default useXMPP;
