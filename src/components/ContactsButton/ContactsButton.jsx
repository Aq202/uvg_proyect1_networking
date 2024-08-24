import PropTypes from "prop-types";
import styles from "./ContactsButton.module.css";
import { FaUsers as UsersIcon } from "react-icons/fa";

function ContactsButton({ onClick, className = "", title = "" }) {
	return (
		<button
			type="button"
			className={`${styles.button} ${className}`}
			onClick={onClick}
			title={title}
		>
			<UsersIcon />
		</button>
	);
}

export default ContactsButton;

ContactsButton.propTypes = {
	onClick: PropTypes.func,
	title: PropTypes.string,
	className: PropTypes.string,
};
