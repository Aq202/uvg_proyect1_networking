// import PropTypes from 'prop-types';
import useSession from '../../hooks/useSession';
import useXMPP from '../../hooks/useXMPP';
import styles from './ChatPage.module.css';

function ChatPage() {

	const { logout } = useSession();
  const {sendMessage} = useXMPP();

  const sendMessageHandler = () => {
    const to = prompt("Para");
    const message = prompt("Mensaje");
    sendMessage(to, message);
  }

  return (
    <div className={styles.ChatPage}>
      <h1>Chat</h1>

			<button onClick={logout}>Logout</button>
      <button onClick={sendMessageHandler}>Enviar mensaje</button>
    </div>
  );
}

export default ChatPage;

ChatPage.propTypes = {

};