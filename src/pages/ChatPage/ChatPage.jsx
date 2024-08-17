// import PropTypes from 'prop-types';
import useSession from '../../hooks/useSession';
import styles from './ChatPage.module.css';

function ChatPage() {

	const { logout } = useSession();

  return (
    <div className={styles.ChatPage}>
      <h1>Chat</h1>

			<button onClick={logout}>Logout</button>

    </div>
  );
}

export default ChatPage;

ChatPage.propTypes = {

};