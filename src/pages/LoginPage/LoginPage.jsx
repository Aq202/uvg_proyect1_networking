// import PropTypes from 'prop-types';
import { useState } from "react";
import useSession from "../../hooks/useSession";
import styles from "./LoginPage.module.css";
import { Link } from "react-router-dom";
import Spinner from "../../components/Spinner/Spinner";

function LoginPage() {
	const { login} = useSession();

	const [loginError, setLoginError] = useState(null);
	const [loading, setLoading] = useState(false);
	const [user, setUser] = useState("");
	const [password, setPassword] = useState("");

	const loginHandler = (e) => {
		e.preventDefault();
		// Validar campos
		if(user.trim().length === 0 || password.trim().length === 0) {
			setLoginError("Debes completar los campos para iniciar sesión.");
			return;
		}

		setLoading(true);
		setLoginError(false);

		login({
			user,
			password,
			callback: (success) => {
				if(!success) setLoginError("Usuario o contraseña incorrectos.");
				setLoading(false);
			},
		});
	};

	return (
		<div className={styles.loginPage}>
			
			<h1 className={styles.title}>XMPP CHAT</h1>
			<form className={styles.loginBody} onSubmit={loginHandler}>
				<p className={styles.instructions}>Ingresa tus credenciales para iniciar sesión</p>
				<input type="text" className={styles.input} placeholder="Usuario" value={user} onChange={e => setUser(e.target.value)}/>
				<input type="password" className={styles.input} placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)}/>
				{!loading ? (
					<button type="submit" className={styles.button}>Iniciar sesión</button>
				) : <Spinner className={styles.spinner}/>}
				{loginError && <p className={styles.error}>{loginError}</p>}
			</form>
			<Link to="/register" className={styles.registerLink}>Registrarse</Link>
		</div>
	);
}

export default LoginPage;

LoginPage.propTypes = {};
