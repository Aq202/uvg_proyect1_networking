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
