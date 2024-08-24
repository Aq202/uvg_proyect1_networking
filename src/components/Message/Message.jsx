import PropTypes from "prop-types";
import styles from "./Message.module.css";
import { IoCheckmarkDone as CheckIcon } from "react-icons/io5";
import dayjs from "dayjs";
import isUrl from "../../utils/isUrl";

function Message({
	left = true,
	user = null,
	message,
	date,
	showTriangle = false,
	viewed = false,
	refObj = null,
	showViewed = true,
}) {
	const formattedTime = dayjs(date).format("HH:mm");

	const isImage = (message) => {
    const regex = /(httpfileupload.*\.(jpg|jpeg|png|gif|bmp|webp|svg))$/i;
    return regex.test(message);
	};

	return (
		<li
			className={`${styles.message} ${left ? styles.left : styles.right} ${
				showTriangle ? styles.triangle : ""
			}`}
			ref={refObj}
		>
			<div className={styles.bubble}>
				{user && left && <span className={styles.user}>{user}</span>}
				<span className={styles.messageText}>
					{isUrl(message) && isImage(message) ? (
						<img src={message} alt={message} className={styles.imageMessage} />

					) : isUrl(message) && message.includes("httpfileupload") ? (
						<>
							<span>Documento adjunto: </span>
							<a href={message} target="_blank" rel="noreferrer">{message}</a>
						</>
						
					) : isUrl(message) ? (
						<a href={message} target="_blank" rel="noreferrer">{message}</a>
					)
					: (
						message
					)}
				</span>
				<div className={styles.messageFooter}>
					<span className={styles.time}>{formattedTime}</span>
					{!left && showViewed && <CheckIcon className={`${styles.checkIcon} ${viewed ? styles.viewed : ""}`} />}
				</div>
			</div>
		</li>
	);
}

export default Message;

Message.propTypes = {
	left: PropTypes.bool,
	user: PropTypes.string,
	message: PropTypes.string.isRequired,
	date: PropTypes.string.isRequired,
	showTriangle: PropTypes.bool,
	viewed: PropTypes.bool,
	refObj: PropTypes.any,
	showViewed: PropTypes.bool,
};
