import { useContext, useEffect } from "react";
import SessionContext from "../context/SessionContext";
import useXMPP from "./useXMPP";

function useSession() {
	const { session, setSession } = useContext(SessionContext);
	const { connection, status, connect, disconnect } = useXMPP();

	/**
	 *
	 * @param user String. Nombre del usuario (sin dominio).
	 * @param password String. Contraseña del usuario.
   * @param callback Función. Función de callback que se ejecuta al conectarse.
   * Devuelve como parametros (success: boolean)
	 */
	const login = async ({ user, password, callback }) => {
		const session = { user, password };
		connect(user, password, (resStatus) => {

			if (resStatus === status.CONNECTED) {
				window.localStorage.setItem("session", JSON.stringify(session));
				setSession(session);
			}

      // Enviar status en callback
      if (callback	&& (resStatus === status.CONNECTED || resStatus === status.AUTHFAIL)) {
        callback(resStatus === status.CONNECTED );
      }
		});
	};

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

	return {
		session,
		login,
		logout,
	};
}
export default useSession;
