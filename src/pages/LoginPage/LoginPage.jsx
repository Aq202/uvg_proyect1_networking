// import PropTypes from 'prop-types';
import { useState } from "react";
import useSession from "../../hooks/useSession";
import styles from "./LoginPage.module.css";

function LoginPage() {
	const { login, logout } = useSession();

	const [loginSuccess, setLoginSuccess] = useState(false);
	return (
		<div className={styles.Login}>
			<h1>Login</h1>
			<button
				onClick={() => {
					login({
						user: prompt("Usuario"),
						password: prompt("Contraseña"),
						callback: (success) => setLoginSuccess(success),
					});
				}}
			>
				Login
			</button>
			<button onClick={logout}>Logout</button>
			<p>{loginSuccess ? "Login exitoso" : "Login fallido"}</p>
		</div>
	);
}

export default LoginPage;

LoginPage.propTypes = {};
