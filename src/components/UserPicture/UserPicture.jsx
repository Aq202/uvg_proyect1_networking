import PropTypes from 'prop-types';
import styles from './UserPicture.module.css';

/**
 * Componente que muestra una imagen de usuario utilizando las iniciales del nombre.
 * También puede mostrar un indicador de estado si el usuario está activo.
 *
 * @param {Object} props - Las propiedades del componente.
 * @param {string} [props.className] - Clase CSS adicional para personalizar el estilo del componente.
 * @param {string} [props.name="Usuario"] - Nombre del usuario, utilizado para mostrar la inicial en el círculo.
 * @param {Function} [props.onClick] - Función a ejecutar cuando el componente es clickeado.
 * @param {boolean} [props.isActive=false] - Si es `true`, indica que el usuario está activo.
 * @param {boolean} [props.showStatus=false] - Si es `true`, muestra un indicador de estado.
 */
function UserPicture({
  name = "Usuario", 
  className = null, 
  onClick = null,
  showStatus = false,
  isActive = false,
}) {
  return (
    <div
      className={`${styles.userPicture} ${className}`}
      title={name}
      onClick={onClick}
    >
      <div className={`${styles.nameCircle} ${showStatus ? styles.showStatus : ''} ${isActive ? styles.active : ''}`}>{name ? name.charAt(0) : 'X'}</div>
    </div>
  );
}

export default UserPicture;

UserPicture.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  isActive: PropTypes.bool,
  showStatus: PropTypes.bool,
};
