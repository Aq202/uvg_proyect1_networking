// import PropTypes from 'prop-types';
import { useState } from "react";
import useSession from "../../hooks/useSession";
import styles from "./RegisterPage.module.css";
import useXMPP from "../../hooks/useXMPP";
import { Link } from "react-router-dom";
import Spinner from "../../components/Spinner/Spinner";

function RegisterPage() {
	const { login} = useSession();
	const {register} = useXMPP();

	const [registerError, setRegisterError] = useState(null);
	const [loading, setLoading] = useState(false);
	const [user, setUser] = useState("");
	const [password, setPassword] = useState("");


	const registerHandler = (e) => {
		e.preventDefault();
		// Validar campos
		if(user.trim().length === 0 || password.trim().length === 0) {
			setRegisterError("Debes completar los campos para iniciar sesión.");
			return;
		}

		setLoading(true);
		setRegisterError(false);

		register(user, password).then(()=>{
			
			// Iniciar sesión
			login({
				user,
				password,
				callback: (success) => {
					if(!success) setRegisterError("No se pudo iniciar sesión con el nuevo usuario.");
					setLoading(false);
				},
			});

		}).catch(err=>{
			setLoading(false);
			setRegisterError(err?.message)
		})
	}
	
	return (
		<div className={styles.registerPage}>
			
			<h1 className={styles.title}>XMPP CHAT</h1>
			<form className={styles.registerBody} onSubmit={registerHandler}>
				<p className={styles.instructions}>Crea una nueva cuenta</p>
				<input type="text" className={styles.input} placeholder="Usuario" value={user} onChange={e => setUser(e.target.value)}/>
				<input type="password" className={styles.input} placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)}/>
				{!loading ? (
					<button type="submit" className={styles.button}>Registrate</button>
				) : <Spinner className={styles.spinner}/>}
				{registerError && <p className={styles.error}>{registerError}</p>}
			</form>
			<Link to="/" className={styles.registerLink}>Iniciar sesión</Link>
		</div>
	);
}

export default RegisterPage;

RegisterPage.propTypes = {};
