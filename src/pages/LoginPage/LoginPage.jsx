// import PropTypes from 'prop-types';
import { useState } from "react";
import useSession from "../../hooks/useSession";
import styles from "./LoginPage.module.css";
import useXMPP from "../../hooks/useXMPP";

function LoginPage() {
	const { login} = useSession();
	const {register} = useXMPP();

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

	const registerHandler = () => {
		const user = prompt("Usuario");
		if(!user) return;
		const password = prompt("Contraseña");
		if(!password) return;

		register(user, password).then(res=>{
			console.log(res);
		}).catch(err=>{
			console.error("Error al registrar (login)", err);
		})
	}
	
	return (
		<div className={styles.Login}>
			<h1>Login</h1>
			<button
				onClick={loginHandler}
			>
				Login
			</button>
			<button onClick={registerHandler}>Registrate</button>
			{loading && <p>Cargando...</p>}
			{loginError && <p>Usuario o contraseña incorrectos.</p>}
		</div>
	);
}

export default LoginPage;

LoginPage.propTypes = {};
