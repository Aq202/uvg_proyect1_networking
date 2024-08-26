import PropTypes from "prop-types";
import styles from "./ContactItem.module.css";
import UserPicture from "../UserPicture/UserPicture";
import useXMPP from "../../hooks/useXMPP";

/**
 * Componente de elemento de contacto que representa un usuario en una lista de contactos de una aplicación de chat.
 *
 * Este componente muestra información del contacto, como el nombre de usuario, alias, estado de presencia y estado personalizado.
 * También permite al usuario interactuar con el contacto, como seleccionarlo o aceptar una solicitud de contacto.
 *
 * @param {Object} props - Las propiedades del componente.
 * @param {string} props.user - El nombre de usuario del contacto. **Requerido**.
 * @param {string|null} props.alias - Un alias opcional para mostrar en lugar del nombre de usuario.
 * @param {string} props.show - El estado de presencia del contacto (por ejemplo, disponible, ausente).
 * @param {string} props.status - El estado personalizado del contacto.
 * @param {boolean} props.active - Indica si el contacto está activo.
 * @param {boolean} props.selected - Indica si el contacto está seleccionado.
 * @param {boolean} props.showActiveStatus - Indica si se debe mostrar el estado de actividad del contacto.
 * @param {boolean} props.showAcceptButton - Indica si se debe mostrar un botón para aceptar una solicitud de contacto.
 * @param {function} props.onClick - Función a ejecutar cuando se hace clic en el contacto. Recibe como parámetro el nombre de usuario.
 * @param {function} props.onAcceptButtonClick - Función a ejecutar cuando se hace clic en el botón "Aceptar solicitud".
 */
function ContactItem({
	user = "",
	alias = null,
	show = "",
	status = "",
	active = false,
	selected = false,
	showActiveStatus = false,
	showAcceptButton = false,
	onClick = null,
	onAcceptButtonClick = null,
}) {
	const { presenceShowValues } = useXMPP();
	const handleClick = () => {
		if (onClick) onClick(user);
	};

	const getShowValue = (show) => {
		if (show === presenceShowValues.AVAILABLE) return "Disponible para chatear";
		if (show === presenceShowValues.AWAY) return "Ausente";
		if (show === presenceShowValues.DND) return "No molestar";
		if (show === presenceShowValues.XA) return "No disponible";
		return "Sin estado";
	};

	const handleButtonClick = (e) => {
		e.stopPropagation();
		if (onAcceptButtonClick) onAcceptButtonClick();
	}

	return (
		<li
			className={`${styles.contactItem} ${selected ? styles.selected : ""}`}
			onClick={handleClick}
			tabIndex={0}
			onKeyUp={handleClick}
			role="button"
		>
			<UserPicture
				name={user}
				className={styles.photo}
				isActive={active}
				showStatus={showActiveStatus}
			/>
			<div className={styles.data}>
				<span className={styles.name}>
					{alias ? <>{alias} <span className={styles.secondaryUser}>{`(${user})`}</span></> : user}
				</span>
				{show && <span className={styles.show}>{getShowValue(show)}</span>}
				{status && <span className={styles.status}>{status}</span>}
			{showAcceptButton && (
				<button
				type="button"
				className={styles.acceptButton}
				onClick={handleButtonClick}
				>
					Aceptar solicitud
				</button>
			)}
			</div>
		</li>
	);
}

export default ContactItem;

ContactItem.propTypes = {
	user: PropTypes.string.isRequired,
	alias: PropTypes.string,
	show: PropTypes.string,
	status: PropTypes.string,
	message: PropTypes.string,
	date: PropTypes.string,
	active: PropTypes.bool,
	notViewed: PropTypes.number,
	selected: PropTypes.bool,
	showActiveStatus: PropTypes.bool,
	onClick: PropTypes.func,
	showAcceptButton: PropTypes.bool,
	onAcceptButtonClick: PropTypes.func,
};
