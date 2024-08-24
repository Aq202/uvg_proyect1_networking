// import PropTypes from 'prop-types';
import { useState } from 'react';
import useSession from '../../hooks/useSession';
import useXMPP from '../../hooks/useXMPP';
import styles from './UserProfile.module.css';

function UserProfile() {

	const { logout, session } = useSession();
  const { presenceShowValues, userStatus, deleteAccount, changeState  } = useXMPP();

  const [showStatus, setShowStatus] = useState("");
  const [status, setStatus] = useState("");




  const handleShowStatusChange = (e) => {
    setShowStatus(e.target.value)
  }

  const handleStatusChange = (e) => {
    setStatus(e.target.value)
  }

  const updateShowStatus = () => {
    changeState({show: showStatus});
    alert("Estado actualizado");
  }

  const updateStatus = () => {
    changeState({status});
    alert("Estado actualizado");
  }

  const handleDelete = () => {
    const res = confirm("¿Estás seguro de que deseas eliminar tu cuenta?");
    if(res) {
      deleteAccount().then(() => {
        alert("Cuenta eliminada");
        logout();
      });
    }
  }


  return (
		<div className={styles.profileBody}>
			<header>
				<h1 className={styles.title}>Perfil</h1>
			</header>

      <h3 className={styles.user}>{session?.user}</h3>
			<form className={styles.form}>
        <div className={styles.inputContainer}>
          <label htmlFor="name">Estado</label>
          <select className={styles.showStatusSelect} defaultValue={userStatus.show} onChange={handleShowStatusChange}>
            <option value={presenceShowValues.AVAILABLE}>Disponible</option>
            <option value={presenceShowValues.AWAY}>Ausente</option>
            <option value={presenceShowValues.DND}>No molestar</option>
            <option value={presenceShowValues.XA}>No disponible</option>
          </select>
        </div>
        
        <button type='button' className={styles.updateButton} onClick={updateShowStatus}>Actualizar</button>

        <div className={styles.inputContainer}>
          <label htmlFor="name">Estado personalizado</label>
          <input className={styles.statusInput} placeholder='Escribe un estado' defaultValue={userStatus.status} onChange={handleStatusChange}/>
        </div>

        <button type='button' className={styles.updateButton} onClick={updateStatus}>Actualizar</button>

        <button type='button' className={styles.deleteButton} onClick={handleDelete}>Eliminar cuenta</button>

      </form>
		</div>
	);
}

export default UserProfile;

UserProfile.propTypes = {

};