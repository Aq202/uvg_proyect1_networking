import PropTypes from "prop-types";
import styles from "./ContactItem.module.css";
import UserPicture from "../UserPicture/UserPicture";
import useXMPP from "../../hooks/useXMPP";

/**
 *
 * @param onClick Function. Function to call when the contact item is clicked. Gives as parameter the user.
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
