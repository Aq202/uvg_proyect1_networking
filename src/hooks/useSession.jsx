import { useContext } from "react";
import SessionContext from "../context/SessionContext";
import useXMPP from "./useXMPP";
import consts from "../utils/consts";
import { Strophe, $pres } from "strophe.js";

function useSession() {
	const { setSession } = useContext(SessionContext);
	const { connection, disconnect } = useXMPP();

	/**
	 *
	 * @param user String. Nombre del usuario (sin dominio).
	 * @param password String. Contraseña del usuario.
   * @param callback Función. Función de callback que se ejecuta al conectarse.
   * Devuelve como parametros (success: boolean)
	 */
	const login = async ({ user, password, callback }) => {
		const session = { user, password };
		connection.connect(`${user}@${consts.serverDomain}`, password, (status) => {
			if (status === Strophe.Status.CONNECTED) {
				connection.send($pres().tree()); // Enviar presencia al servidor

				window.localStorage.setItem("session", JSON.stringify(session));
				setSession(session);
			}

      // Enviar status en callback
      if (callback) {
        callback(status === Strophe.Status.CONNECTED);
      }
		});
	};

	const logout = () => {
		window.localStorage.removeItem("session");
		setSession(null);

    // Cerrar la conexión
		disconnect();
	};

	return {
		login,
		logout,
	};
}
export default useSession;
