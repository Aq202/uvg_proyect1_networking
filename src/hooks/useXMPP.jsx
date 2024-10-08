import { useContext } from "react";
import XMPPContext from "../context/XMPPContext";
import { Strophe, $pres, $msg, $iq } from "strophe.js";
import { client, xml } from '@xmpp/client/browser';
import consts from "../utils/consts";

/**
 * Hook personalizado para manejar la lógica de XMPP dentro de la aplicación.
 * @returns {Object} Funciones y estados relacionados con la conexión XMPP.
 */
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

	/**
	 * Maneja los mensajes entrantes.
	 * @param {Element} msg - El mensaje XML recibido.
	 * @returns {boolean} `true` para mantener el manejador activo.
	 */
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
	
	/**
	 * Conecta al usuario al servidor XMPP.
	 * @param {string} user - El nombre de usuario.
	 * @param {string} password - La contraseña del usuario.
	 * @param {function} callback - Función a ejecutar después de la conexión.
	 */
	const connect = (user, password, callback) => {
		connection.connect(
			`${user}@${consts.serverDomain}/${consts.connectionResource}`,
			password,
			(resStatus) => {
				if (resStatus === status.CONNECTED) {
					connection.addHandler(onMessage, null, "message", "chat", null); // Escuchar mensajes
					connection.addHandler(handleSubscriptionRequest, null, "presence", "subscribe"); // Escuchar solicitudes de suscripción
					connection.addHandler(handleSubscriptionAccepted, null, "presence", "subscribed"); // Escuchar cuando una suscripción es aceptada
					connection.addHandler(onPresence, null, "presence"); // Escuchar presencia
					connection.addHandler(onRoomMessage, null, "message", "groupchat"); // Escuchar mensajes de salas de chat

					connection.send($pres({})); // Enviar presence con status 'disponible'

					getRoster();
					changeState({show: presenceShowValues.AVAILABLE});
				}

				if (callback) callback(resStatus);
			}
		);
	};

	/**
	 * Desconecta al usuario del servidor XMPP y limpia las variables de estado.
	 */
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

	/**
	 * Envía un mensaje a otro usuario.
	 * @param {string} recipientUser - El nombre de usuario del destinatario.
	 * @param {string} message - El mensaje a enviar.
	 */
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

	/**
	 * Agrega un contacto al roster.
	 * @param {string} jid - El JID del usuario a agregar.
	 * @param {string} name - El nombre del usuario a agregar.
	 * @returns {Promise<void>} Promesa que se resuelve cuando el contacto ha sido agregado.
	 */
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
	
	/**
	 * Agrega un contacto y envía una solicitud de suscripción.
	 * @param {string} user - El nombre de usuario del contacto.
	 * @param {string} alias - El alias del contacto.
	 */
	const addContact = (user, alias) => {
		const jid = `${user}@${consts.serverDomain}`;
		addContactToRoster(jid, alias).then(() => {
			connection.send($pres({ to: jid, type: "subscribe" }));
		});
	};

	/**
	 * Acepta una solicitud de suscripción de otro usuario.
	 * @param {string} user - El nombre de usuario del solicitante.
	 * @param {string} alias - El alias del solicitante.
	 */
	const acceptSubscription = (user, alias) => {
		const jid = `${user}@${consts.serverDomain}`;
		addContactToRoster(jid, alias).then(() => {
			connection.send($pres({ to: jid, type: "subscribed" }));
			connection.send($pres({ to: jid, type: "subscribe" }));

			// Eliminar de la lista de solicitudes
			setSubscriptionRequests((prev) => prev.filter((userName) => user !== userName));
		});
	};

	/**
	 * Maneja una solicitud de suscripción entrante.
	 * @param {Element} presence - El elemento de presencia XML recibido.
	 * @returns {boolean} `true` para mantener el manejador activo.
	 */
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

	/**
	 * Callback para cuando una suscripción es aceptada. Actualiza el roster
	 */
	const handleSubscriptionAccepted = () => {
		getRoster();
		setTimeout(getRoster, 3000); // Actualizar roster después de un tiempo

	}

	/**
	 * Maneja la presencia de estado de usuarios en el roster.
	 * @param {Element} presence - El elemento de presencia XML recibido.
	 */
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

	};

	/**
	 * Maneja la presencia de usuarios en una sala de chat.
	 * @param {Element} presence - El elemento de presencia XML recibido.
	 */
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

	/**
	 * Maneja actualizaciones de presencia de otros usuarios.
	 * @param {Element} presence - El elemento de presencia XML recibido.
	 * @returns {boolean} `true` para mantener el manejador activo.
	 */
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

	/**
	 * Cambia el estado de presencia del usuario actual.
	 * @param {Object} status - El nuevo estado de presencia del usuario.
	 */
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

	/**
	 * Eliminar la cuenta del usuario en sesión.
	 * @returns Promise. Resolve(). Reject()
	 */
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

	/**
	 * Crea una sala de chat o se une a una sala existente.
	 * @param {string} room - El nombre de la sala de chat.
	 * @param {boolean} create - Indica si se debe crear la sala si no existe.
	 */
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
	
	/**
	 * Envía un mensaje en una sala de chat.
	 * @param {string} room - El nombre de la sala de chat.
	 * @param {string} message - El mensaje a enviar.
	 */
	const sendRoomMessage = (roomName, message) => {
		const msg = $msg({
			to: `${roomName}@conference.${consts.serverDomain}`,
			type: "groupchat",
		})
			.c("body")
			.t(message);

		connection.send(msg);
	};

	/**
	 * Maneja mensajes entrantes en una sala de chat.
	 * @param {Element} msg - El elemento de mensaje XML recibido.
	 * @returns {boolean} `true` para mantener el manejador activo.
	 */
	const onRoomMessage = (msg) => {
		
		const stanzaIdElement = msg.getElementsByTagNameNS('urn:xmpp:sid:0', 'stanza-id')[0];
		let stanzaId = null;
    
    if (stanzaIdElement) {
        stanzaId = stanzaIdElement.getAttribute('id');
    }

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
				const message = { nickname, message: messageText, date: new Date(), viewed: false, stanzaId };
				if (!newRooms[room]) {
					// Si la sala no existe, crearla
					newRooms[room] = {
						users: {},
						messages: [message],
					};
				} else {
					// Si la sala existe
					// Verificar si el mensaje ya existe
					const exists = newRooms[room].messages.some((msg) => msg.stanzaId === stanzaId);
					if(!exists){
						newRooms[room].messages.push(message);//agregar el mensaje
					}				
				
				}

				return newRooms;
			});
		}

		return true; // Mantener el manejador activo
	};

	/**
	 * Obtiene la URL de subida de un archivo
	 * @param {string} filename - Nombre del archivo
	 * @param {number} size - Tamaño del archivo
	 * @param {string} contentType - Tipo de contenido del archivo
	 * @returns 
	 */
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

	/**
	 * Crea un nuevo chat con un contacto si no existe previamente.
	 * @param {string} user - El nombre de usuario con el que iniciar el chat.
	 */
	const createEmptyChat = (user) =>
		setMessages((prev) => {
			if (prev[user]) return prev;
			return { ...prev, [user]: [] };
	});

	/**
	 * Envia un mensaje vacío para confirmar que el mensaje fue visto.
	 * @param {string} user Nombre de usuario del receptor.
	 * @returns 
	 */
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

	/**
	 * Marca (localmente) todos los mensajes de una sala como vistos.
	 * @param {string} room Nombre de la sala
	 * @returns 
	 */
	const markAllRoomMessagesAsViewed = (room) => {
		if(!rooms[room]) return; // No hay mensajes en la sala

		setRooms((prev) => {
			const newRooms = {...prev};
			newRooms[room].messages = newRooms[room].messages.map((msg) => ({...msg, viewed: true}));
			return newRooms;
		});
	}

	/**
	 * Crea un nuevo usuario en el servidor XMPP.
	 * @param {string} user Nombre de usuario
	 * @param {string} password Contraseña
	 * @returns Promise. Resolve({status, message}). Reject({status, message})
	 */
	const register = (user, password) =>
		new Promise((resolve, reject) => {
			try {
				const xmppClient = client({
					service: `ws://${consts.serverDomain}:${consts.serverPort}/ws`,
					resource: consts.connectionResource,
				});

				xmppClient.on("error", (err) => {
					if (err.code === "ECONERROR") {
						xmppClient.stop();
						xmppClient.removeAllListeners();
						reject({ status: false, message: "Error en el cliente XMPP" });
					}
				});

				xmppClient.on("open", () => {
					const iq = xml(
						"iq",
						{ type: "set", to: "alumchat.lol", id: "register" },
						xml(
							"query",
							{ xmlns: "jabber:iq:register" },
							xml("username", {}, user),
							xml("password", {}, password)
						)
					);
					xmppClient.send(iq);
				});

				xmppClient.on("stanza", async (stanza) => {
					if (stanza.is("iq") && stanza.getAttr("id") === "register") {
						await xmppClient.stop();
						xmppClient.removeAllListeners();

						if (stanza.getAttr("type") === "result") {

							// Registro exitoso
							resolve({ status: true, message: "Registro exitoso." });

						} else if (stanza.getAttr("type") === "error") {

							// Error manejado del servidor
							const error = stanza.getChild("error");
							if (error?.getChild("conflict")) {
								reject({ status: false, message: "El nombre de usuario no está disponible." });
							}
							reject({
								status: false,
								message: "Ocurrió un error en tu registro. Intenta nuevamente.",
							});
						}
					}
				});

				xmppClient.start().catch((err) => {
					// Se ignora el error invalid-mechanism (ya que es propio de la libreria)
					if (!err.toString().includes("invalid-mechanism")) {
						reject({ status: false, message: "Ocurrió un error en la conexión." });
					}
				});
			} catch (error) {
				reject({ status: false, message: "Ocurrió un error en el registro." });
			}
	});		

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
		register,
		setMessages,
		setRooms,
	};
};

export default useXMPP;
