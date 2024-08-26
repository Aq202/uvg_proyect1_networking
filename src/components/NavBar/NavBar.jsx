import PropTypes from 'prop-types';
import styles from "./NavBar.module.css";
import { IoChatbubbles as ChatIcon } from "react-icons/io5";
import GroupChatIcon from "../../assets/icons/group-chat.svg";
import { RiContactsBook3Fill as ContactIcon } from "react-icons/ri";
import { IoExitSharp as ExitIcon } from "react-icons/io5";
import { MdAccountCircle as ProfileIcon } from "react-icons/md";

/**
 * Componente de barra de navegación para una aplicación de chat.
 *
 * Proporciona accesos directos a diferentes secciones de la aplicación:
 * - Chats activos
 * - Grupos
 * - Contactos
 * - Perfil
 * - Salir
 *
 * Cada opción se representa como un botón que ejecuta una función de callback cuando es clickeado o activado con el teclado.
 *
 * @param {Object} props - Las propiedades del componente.
 * @param {function} props.onChatOptionClick - Función callback al hacer clic en la opción de chats activos.
 * @param {function} props.onGroupChatOptionClick - Función callback al hacer clic en la opción de grupos.
 * @param {function} props.onContactsOptionClick - Función callback al hacer clic en la opción de contactos.
 * @param {function} props.onExitOptionClick - Función callback al hacer clic en la opción de salir.
 * @param {function} props.onProfileOptionClick - Función callback al hacer clic en la opción de perfil.
 */
function NavBar({
	onChatOptionClick,
	onGroupChatOptionClick,
	onContactsOptionClick,
	onExitOptionClick,
	onProfileOptionClick,
}) {
	return (
		<nav className={styles.navBar}>
			<ul>
				<li
					onClick={onChatOptionClick}
					onKeyUp={onChatOptionClick}
					tabIndex={0}
					role="button"
				>
					<ChatIcon className={styles.icon} />
					<span>Chats activos</span>
				</li>
				<li
					onClick={onGroupChatOptionClick}
					onKeyUp={onGroupChatOptionClick}
					tabIndex={1}
					role="button"
				>
					<img
						src={GroupChatIcon}
						alt="Group chat"
						className={styles.groupChatIcon}
					/>
					<span>Grupos</span>
				</li>
				<li
					onClick={onContactsOptionClick}
					onKeyUp={onContactsOptionClick}
					tabIndex={2}
					role="button"
					>
					<ContactIcon className={styles.icon} />
					<span>Contactos</span>
				</li>
				<li
					onClick={onProfileOptionClick}
					onKeyUp={onProfileOptionClick}
					tabIndex={3}
					role="button"
				>
					<ProfileIcon className={styles.icon} />
					<span>Perfil</span>
				</li>
				<li
					onClick={onExitOptionClick}
					onKeyUp={onExitOptionClick}
					tabIndex={4}
					role="button"
				>
					<ExitIcon className={styles.icon} />
					<span>Salir</span>
				</li>
			</ul>
		</nav>
	);
}

export default NavBar;

NavBar.propTypes = {
	onChatOptionClick: PropTypes.func.isRequired,
	onGroupChatOptionClick: PropTypes.func.isRequired,
	onContactsOptionClick: PropTypes.func.isRequired,
	onExitOptionClick: PropTypes.func.isRequired,
	onProfileOptionClick: PropTypes.func.isRequired,
};
