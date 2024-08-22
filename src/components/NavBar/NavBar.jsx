// import PropTypes from 'prop-types';
import styles from "./NavBar.module.css";
import { IoChatbubbles as ChatIcon } from "react-icons/io5";
import GroupChatIcon from "../../assets/icons/group-chat.svg";
import { RiContactsBook3Fill as ContactIcon } from "react-icons/ri";

function NavBar() {
	return (
		<nav className={styles.navBar}>
			<ul>
				<li>
					<ChatIcon className={styles.icon} />
					<span>Chats activos</span>
				</li>
				<li>
					<img
						src={GroupChatIcon}
						alt="Group chat"
						className={styles.groupChatIcon}
					/>
					<span>Grupos</span>
				</li>
				<li>
					<ContactIcon className={styles.icon} />

					<span>Contactos</span>
				</li>
			</ul>
		</nav>
	);
}

export default NavBar;

NavBar.propTypes = {};
