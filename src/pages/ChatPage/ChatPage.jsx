// import PropTypes from 'prop-types';
import useSession from '../../hooks/useSession';
import useXMPP from '../../hooks/useXMPP';
import styles from './ChatPage.module.css';

function ChatPage() {

	const { logout, session } = useSession();
  const { sendMessage, getRoster, addContact, acceptSubscription, subscriptionRequests } = useXMPP();

  const sendMessageHandler = () => {
    const to = prompt("Para");
    const message = prompt("Mensaje");
    sendMessage(to, message);
  }

  const addContactHandler = () => {
    const contact = prompt("Contacto");
    const alias = prompt("Alias");
    addContact(contact, alias);
  }

  return (
    <div className={styles.ChatPage}>
      <h1>Chat de {session.user}</h1>

			<button onClick={logout}>Logout</button>
      <button onClick={sendMessageHandler}>Enviar mensaje</button>
      <button onClick={getRoster}>Obtener contactos</button>
      <button onClick={addContactHandler}>Añadir contacto</button>

      <br />
      <h3>Solicitudes de amistad</h3>
      {
        subscriptionRequests?.map((user, i) => (
          <div key={i}>
            {user}
            <button onClick={() => acceptSubscription(user, prompt("Ingresar alias"))}>
              Aceptar
            </button>
          </div>
        ))
      }
    </div>
  );
}

export default ChatPage;

ChatPage.propTypes = {

};