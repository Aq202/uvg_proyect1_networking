import PropTypes from "prop-types";
import styles from "./ChatItem.module.css";
import UserPicture from "../UserPicture/UserPicture";
import dayjs from 'dayjs';

/**
 * Componente de elemento de chat que representa un chat individual en la lista de chats.
 *
 * Este componente muestra información como el nombre del usuario, un alias opcional, el último mensaje enviado,
 * la fecha de ese mensaje, y el número de mensajes no vistos.
 *
 * @param {Object} props - Las propiedades del componente.
 * @param {string} props.user - El nombre de usuario del chat.
 * @param {string} [props.alias] - Alias opcional del usuario.
 * @param {string} [props.message] - El último mensaje enviado en el chat.
 * @param {string} [props.date] - La fecha del último mensaje enviado.
 * @param {boolean} [props.active] - Indica si el usuario está activo.
 * @param {number} [props.notViewed] - El número de mensajes no vistos en el chat.
 * @param {boolean} [props.selected] - Indica si el elemento de chat está seleccionado.
 * @param {boolean} [props.showStatus] - Indica si se debe mostrar el estado del usuario.
 * @param {Function} [props.onClick] - Función a ejecutar cuando se hace clic en el elemento de chat.
 */
function ChatItem({
	user = "",
	alias = null,
	message = "",
	date = "",
	active = false,
	notViewed = 0,
  selected = false,
  showStatus = false,
  onClick = null,
}) {

  const formatDate = (date) => {

    if(!date) return "";
    const now = dayjs();
    const givenDate = dayjs(date);
  
    if (givenDate.isSame(now, 'day')) {
      return givenDate.format('HH:mm');
    } else {
      return givenDate.format('DD-MM-YYYY');
    }
  }

  const handleClick = () => {
    if(onClick) onClick(user);
  }

	return (
		<li
			className={`${styles.chatItem} ${selected ? styles.selected : ""}`}
			onClick={handleClick}
			tabIndex={0}
			onKeyUp={handleClick}
			role="button"
		>
			<UserPicture
				name={user}
				className={styles.photo}
				isActive={active}
				showStatus={showStatus}
			/>
			<span className={styles.name}>
				{alias ? <>{alias} <span className={styles.secondaryUser}>{`(${user})`}</span></> : user}
			</span>
			<span className={styles.date}>{formatDate(date)}</span>
			<p className={styles.lastMessage}>{message}</p>
			{notViewed > 0 && <span className={styles.notViewed}>{notViewed}</span>}
		</li>
	);
}

export default ChatItem;

ChatItem.propTypes = {
	user: PropTypes.string.isRequired,
	alias: PropTypes.string,
	message: PropTypes.string,
	date: PropTypes.string,
	active: PropTypes.bool,
	notViewed: PropTypes.number,
  selected: PropTypes.bool,
  showStatus: PropTypes.bool,
  onClick: PropTypes.func,
};
