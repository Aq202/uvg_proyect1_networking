import PropTypes from "prop-types";
import styles from "./AddContactButton.module.css";
import { TiUserAdd as AddUserIcon } from "react-icons/ti";

function AddContactButton({ onClick, className = "", title = "Añadir a contactos" }) {
	return (
		<button
			type="button"
			className={`${styles.addButton} ${className}`}
			onClick={onClick}
			title={title}
		>
			<AddUserIcon />
		</button>
	);
}

export default AddContactButton;

AddContactButton.propTypes = {
	onClick: PropTypes.func,
	title: PropTypes.string,
	className: PropTypes.string,
};
