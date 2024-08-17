// import PropTypes from 'prop-types';
import { useState } from "react";
import useSession from "../../hooks/useSession";
import styles from "./LoginPage.module.css";

function LoginPage() {
	const { login} = useSession();

	const [loginError, setLoginError] = useState(false);
	const [loading, setLoading] = useState(false);

	const loginHandler = () => {

		setLoading(true);
		setLoginError(false);

		login({
			user: prompt("Usuario"),
			password: prompt("Contraseña"),
			callback: (success) => {

				if(!success) setLoginError(true);
				setLoading(false);
			},
		});
	};
	
	return (
		<div className={styles.Login}>
			<h1>Login</h1>
			<button
				onClick={loginHandler}
			>
				Login
			</button>
			{loading && <p>Cargando...</p>}
			{loginError && <p>Usuario o contraseña incorrectos.</p>}
		</div>
	);
}

export default LoginPage;

LoginPage.propTypes = {};
