import { useContext } from "react";
import XMPPContext from "../context/XMPPContext";
import { Strophe, $pres, $msg, $iq } from "strophe.js";
import consts from "../utils/consts";

const useXMPP = () => {
	const {
		connection,
		subscriptionRequests,
		rooms,
		messages,
		roster,
		userStatus,
		userStates,
		setSubscriptionRequests,
		setUserStates,
		setRooms,
		setMessages,
		setRoster,
		setUserStatus,
	} = useContext(XMPPContext);

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

		const user = from.split("@")[0];
		const message = { user, message: body, date: new Date(), viewed: false, sent: false };

		setMessages((prev) => {
			if(!prev[user] && body === "") return prev; // No hay mensajes previos y es un mensaje de confirmación de visto
			if (!prev[user]) return { ...prev, [user]: [message] }; // Primer mensaje de un usuario
			if(body !== "") return { ...prev, [user]: [...prev[user], message] }; // Mensaje normal

				// Mensaje de confirmación de visto
				// Marcar como visto los mensajes que este cliente envió
				const newMessages = {...prev};
				newMessages[user] = newMessages[user].map((msg) => (!msg.sent ? msg : {...msg, viewed: true}));
				return newMessages;

		});

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
					connection.addHandler(onPresence, null, "presence"); // Escuchar presencia
					connection.addHandler(onRoomMessage, null, "message", "groupchat"); // Escuchar mensajes de salas de chat

					connection.addHandler(
						(stanza) => {
							console.error("Error recibido:", Strophe.serialize(stanza));
							return true; // Mantener el manejador activo
						},
						null,
						"message",
						"error"
					);

					connection.send($pres({})); // Enviar presence con status 'disponible'

					getRoster();
					changeState({show: presenceShowValues.AVAILABLE});
				}

				if (callback) callback(resStatus);
			}
		);
	};

	const disconnect = () => {
		//Enviar presence de status de desconexión
		connection.send($pres({ type: "unavailable" }));

		connection.disconnect();

		// Limpiar variables
		setSubscriptionRequests([]);
		setMessages({});
		setRooms({});
		setRoster({});
		setUserStates({});
	};

	const sendMessage = (recipientUser, message) => {
		const msg = $msg({
			to: `${recipientUser}@${consts.serverDomain}/${consts.connectionResource}`,
			from: connection.jid,
			type: "chat",
		})
			.c("body")
			.t(message);

		// Enviar el mensaje
		connection.send(msg);

		if(message === "") return; // No guardar mensajes de confirmación de visto

		const messageObj = { user: recipientUser, message, date: new Date(), viewed: false, sent: true };
		setMessages((prev) => {
			if (!prev[recipientUser]) return { ...prev, [recipientUser]: [messageObj] };
			return { ...prev, [recipientUser]: [...prev[recipientUser], messageObj] };
		});

	};

	/**
	 * Obtener los contactos en el roster
	 * @returns Promise. Resolve(Contacts). Reject(Error)
	 */
	const getRoster = () => new Promise((resolve, reject) => {
		// Solicitar roster al servidor
		const iq = $iq({
			type: "get",
			xmlns: "jabber:client",
		}).c("query", { xmlns: "jabber:iq:roster" });

		connection.sendIQ(
			iq,
			(response) => {

				// Se obtuvieron los contactos en el roster
				const items = response.getElementsByTagName("item");
				const contacts = {};
		
				for (let i = 0; i < items.length; i++) {
					const jid = items[i].getAttribute("jid");

					const user = jid.split("@")[0];
					const alias = items[i].getAttribute("name");
					const subscription = items[i].getAttribute("subscription");

					contacts[user] = { user, alias, subscription };

					// Añadir contacto a lista de mensajes si no existe
					createEmptyChat(user);
				}
				// Añadir a variable de estado en context
				setRoster(contacts);
				resolve(contacts);
			},
			reject,
		);
	});

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

			connection.sendIQ(iq, ()=>{
				
				getRoster().then(resolve()); // Resolver promesa hasta actualizar roster
			}, reject);
		});

	const addContact = (user, alias) => {
		const jid = `${user}@${consts.serverDomain}`;
		addContactToRoster(jid, alias).then(() => {
			connection.send($pres({ to: jid, type: "subscribe" }));
		});
	};

	const acceptSubscription = (user, alias) => {
		const jid = `${user}@${consts.serverDomain}`;
		addContactToRoster(jid, alias).then(() => {
			connection.send($pres({ to: jid, type: "subscribed" }));
			connection.send($pres({ to: jid, type: "subscribe" }));

			// Eliminar de la lista de solicitudes
			setSubscriptionRequests((prev) => prev.filter((userName) => user !== userName));
		});
	};

	function handleSubscriptionRequest(presence) {

		getRoster().then(rosterResult => {

			const senderJid = Strophe.getBareJidFromJid(presence.getAttribute("from"));
			const user = senderJid.split("@")[0];

			// Si el usuario que solicita ya está dentro del roster, aceptar automáticamente
			if (rosterResult[user]) {
				connection.send($pres({ to: senderJid, type: "subscribed" }));
				return true; // Continúa escuchando otros mensajes
			}

			// Agregar a la lista de solicitudes
			setSubscriptionRequests((prev) => [...prev, user]);

			return true; // Continúa escuchando otros mensajes
	})
	}

	const handleStatusPresence = (presence) => {
		const from = presence.getAttribute("from");
		const type = presence.getAttribute("type");

		// Es una presencia estándar de un usuario
		const user = from.split("@")[0];
		const userStatus = {
			available: type !== "unavailable",
		};

		// Guardar datos del estado del usuario
		setUserStates((prev) => {
			const prevUserStatus = prev[user] ?? {};

			if (userStatus.available) {
				userStatus.show = Strophe.getText(presence.getElementsByTagName("show")[0]) ?? prevUserStatus.show;
				userStatus.status = Strophe.getText(presence.getElementsByTagName("status")[0]) ?? prevUserStatus.status;
			}

			return {...prev, [user]: userStatus};
		});

		// Verificar si el contacto está en el roster, si no está, actualizar roster
		if (!roster[user]) {
			getRoster();
		}
	};

	const handleRoomPresence = (presence) => {
		const from = presence.getAttribute("from");
		const type = presence.getAttribute("type");

		const roomJid = Strophe.getBareJidFromJid(from);
		const room = roomJid.split("@")[0];

		const nickname = Strophe.getResourceFromJid(from);

		// Aquí puedes manejar el status específico de los usuarios en la sala
		const roomUserStatus = {
			available: type !== "unavailable",
			nickname,
		};

		setRooms((prev) => {
			const newRooms = { ...prev };

			if (!newRooms[room]) {
				// Si la sala no existe, crearla
				newRooms[room] = {
					users: { [nickname]: roomUserStatus },
					messages: [],
				};
			} else if (!newRooms[room][nickname]) {
				// Si el usuario no existe en la sala, agregarlo
				newRooms[room].users[nickname] = roomUserStatus;
			} else {
				// Si el usuario existe, actualizar su estado
				newRooms[room].users[nickname] = roomUserStatus;
			}

			return newRooms;
		});
	};

	const onPresence = (presence) => {
		const from = presence.getAttribute("from");

		// Diferenciar entre presencias de usuarios y de salas de chat
		if (from.includes("conference")) {
			handleRoomPresence(presence);
		} else {
			handleStatusPresence(presence);
		}

		return true;
	};

	const changeState = ({show, status}) => {
		const pres = $pres();
		if (show) pres.c("show").t(show);
		if (status && !show) pres.c("status").t(status);
		else if(status) pres.up().c("status").t(status);

		connection.send(pres);

		setUserStatus(prev => {
			const showValue = show ?? prev.show;
			const statusValue = status ?? prev.status;
			return { show: showValue, status: statusValue };
		})
	};

	const deleteAccount = () =>
		new Promise((resolve, reject) => {
			const iq = $iq({ type: "set", to: connection.domain })
				.c("query", { xmlns: "jabber:iq:register" })
				.c("remove");

			connection.sendIQ(iq, resolve, reject);
		});

	const configureRoom = (roomName) => {
		const iq = $iq({
			to: `${roomName}@conference.${consts.serverDomain}`,
			type: "set",
		})
			.c("query", { xmlns: "http://jabber.org/protocol/muc#owner" })
			.c("x", { xmlns: "jabber:x:data", type: "submit" })
			.c("field", { var: "FORM_TYPE", type: "hidden" })
			.c("value")
			.t("http://jabber.org/protocol/muc#roomconfig");

		iq.c("field", { var: "muc#room_persistent", type: "boolean" }).c("value").t("1"); // Hacer la sala persistente

		connection.sendIQ(iq, null, null);
	};

	const joinRoom = (roomName, nick) =>
		new Promise((resolve, reject) => {
			const presence = $pres({
				from: connection.jid,
				to: `${roomName}@conference.${consts.serverDomain}/${nick}`,
			}).c("x", { xmlns: "http://jabber.org/protocol/muc" });

			connection.send(presence);

			// Escuchar la respuesta al intentar unirse a la sala
			connection.addHandler(
				(presence) => {
					const type = presence.getAttribute("type");

					if (!type || type === "available") {
						// Se ha unido a la sala

						// Verificar si es moderador para configurar la sala
						const x = presence.getElementsByTagName("x")?.[0];
						const item = x?.getElementsByTagName("item")?.[0];
						const role = item?.getAttribute("role");
						if (role === "moderator") {
							// Si es moderador, configurar la sala
							configureRoom(roomName);
						}

						resolve();
					} else if (type === "error") {
						reject(presence);
					}

					return false; // Matar el manejador
				},
				null,
				"presence",
				null,
				null,
				`${roomName}@conference.${consts.serverDomain}/${nick}`
			);
		});

	const sendRoomMessage = (roomName, message) => {
		const msg = $msg({
			to: `${roomName}@conference.${consts.serverDomain}`,
			type: "groupchat",
		})
			.c("body")
			.t(message);

		connection.send(msg);
	};

	const onRoomMessage = (msg) => {
		const from = msg.getAttribute("from");
		const roomJid = Strophe.getBareJidFromJid(from);
		const room = roomJid.split("@")[0];

		const body = msg.getElementsByTagName("body")[0];

		if (body) {
			const messageText = Strophe.getText(body);

			// Extraer el nickname del remitente
			const fromParts = from.split("/");
			const nickname = fromParts.length > 1 ? fromParts[1] : fromParts[0];

			// Guardar el mensaje en el estado
			setRooms((prev) => {
				const newRooms = { ...prev };
				const message = { nickname, message: messageText, date: new Date(), viewed: false };
				if (!newRooms[room]) {
					// Si la sala no existe, crearla
					newRooms[room] = {
						users: {},
						messages: [message],
					};
				} else {
					// Si la sala existe, agregar el mensaje
					newRooms[room].messages.push(message);
				}

				return newRooms;
			});
		}

		return true; // Mantener el manejador activo
	};

	const getUploadUrl = ({ filename, size, contentType }) =>
		new Promise((resolve, reject) => {
			// Solicitar URL de subida
			const request = $iq({
				type: "get",
				to: `${consts.uploadFilesSubdomain}.${consts.serverDomain}`,
			}).c("request", {
				xmlns: "urn:xmpp:http:upload:0",
				filename,
				size,
				contentType,
			});

			connection.sendIQ(
				request,
				(response) => {
					const slot = response.querySelector("slot");
					const putUrl = slot?.querySelector("put")?.getAttribute("url");

					if(!putUrl) reject("No se pudo obtener la URL de subida.");
					resolve(putUrl);
				},
				(error) => reject(error)
			);
		});

		const createEmptyChat = (user) =>
			setMessages((prev) => {
				if (prev[user]) return prev;
				return { ...prev, [user]: [] };
			});

		const sendViewedConfirmation = (user) => {
			if(!messages[user]) return;	// No hay mensajes con el usuario
			
			// Verificar si hay mensajes no vistos
			const notViewedMessages = messages[user].some((msg) => !msg.viewed && !msg.sent); 
			if(!notViewedMessages) return;
			
			sendMessage(user, ""); // Mensaje vacío para confirmar que el mensaje fue visto

			// marcar los mensajes que este cliente recibió como vistos
			setMessages((prev) => {
				const newMessages = {...prev};
				newMessages[user] = newMessages[user].map((msg) => (msg.sent ? msg : {...msg, viewed: true}));
				return newMessages;
			});

		}

		const markAllRoomMessagesAsViewed = (room) => {
			if(!rooms[room]) return; // No hay mensajes en la sala

			setRooms((prev) => {
				const newRooms = {...prev};
				newRooms[room].messages = newRooms[room].messages.map((msg) => ({...msg, viewed: true}));
				return newRooms;
			});
		}

	return {
		status,
		connection,
		subscriptionRequests,
		presenceShowValues,
		rooms,
		messages,
		roster,
		userStates,
		userStatus,
		connect,
		disconnect,
		sendMessage,
		getRoster,
		addContact,
		acceptSubscription,
		changeState,
		deleteAccount,
		joinRoom,
		sendRoomMessage,
		getUploadUrl,
		createEmptyChat,
		sendViewedConfirmation,
		markAllRoomMessagesAsViewed,
	};
};

export default useXMPP;
