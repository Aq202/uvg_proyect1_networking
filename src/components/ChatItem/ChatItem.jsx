import PropTypes from "prop-types";
import styles from "./ChatItem.module.css";
import UserPicture from "../UserPicture/UserPicture";
import dayjs from 'dayjs';

/**
 * 
 * @param onClick Function. Function to call when the chat item is clicked. Gives as parameter the user of the chat. 
 */
function ChatItem({
	user = "",
	message = "",
	date = "",
	active = false,
	notViewed = 0,
  selected = false,
  isContact = false,
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
				showStatus={isContact}
			/>
			<span className={styles.name}>{user}</span>
			<span className={styles.date}>{formatDate(date)}</span>
			<p className={styles.lastMessage}>{message}</p>
			{notViewed > 0 && <span className={styles.notViewed}>{notViewed}</span>}
		</li>
	);
}

export default ChatItem;

ChatItem.propTypes = {
	user: PropTypes.string.isRequired,
	message: PropTypes.string,
	date: PropTypes.string,
	active: PropTypes.bool,
	notViewed: PropTypes.number,
  selected: PropTypes.bool,
  isContact: PropTypes.bool,
  onClick: PropTypes.func,
};
