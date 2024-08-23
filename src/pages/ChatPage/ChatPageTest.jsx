// import PropTypes from 'prop-types';
import { useState } from 'react';
import useSession from '../../hooks/useSession';
import useXMPP from '../../hooks/useXMPP';
import styles from './ChatPage.module.css';

function ChatPage() {

	const { logout, session } = useSession();

  const [file, setFile] = useState(null);


  const {
		sendMessage,
		getRoster,
		addContact,
		acceptSubscription,
		subscriptionRequests,
		changeState,
		presenceShowValues,
    deleteAccount,
    joinRoom,
    sendRoomMessage,
    getContactDetails,
    getUploadUrl,
	} = useXMPP();

  const sendMessageHandler = () => {
    const to = prompt("Para");
    const message = prompt("Mensaje") ?? "";
    sendMessage(to, message);
  }

  const addContactHandler = () => {
    const contact = prompt("Contacto");
    const alias = prompt("Alias");
    addContact(contact, alias);
  }

  const handleDeleteAccount = () => {
    deleteAccount().then(() => {
      alert("Cuenta eliminada");
      logout();
    });
  }

  const handleJoinRoom = () => {
    const roomName = prompt("Nombre de la sala");
    const nick = prompt("Nickname");
    joinRoom(roomName, nick).then(()=>{
      alert("Te haz unido a la sala.");
    })
  }

  const handleSendRoomMessage = () => {
    const roomName = prompt("Nombre de la sala");
    const message = prompt("Mensaje");
    sendRoomMessage(roomName, message);
  }

  const handleGetUserData = () => {
    getContactDetails(prompt("Usuario")).then((data) => {
      console.log(data);
    });
  }


  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSendFile = () => {
		if (file) {
			getUploadUrl({ filename: file.name, size: file.size, contentType: file.type }).then((url) => {
				fetch(url, {
					method: "PUT",
					body: file,
				}).then(() => {
					alert("Archivo Subido");
					console.log("Archivo Subido a: ", url);
				});
			});
		}
	};

  const handleDownloadFile = () => {
    const url = prompt("URL del archivo");
    fetch(url).then((response) => {
      response.blob().then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "file";
        a.click();
      });
    });
  }

  return (
    <div className={styles.ChatPage}>
      <h1>Chat de {session?.user}</h1>

			<button onClick={logout}>Logout</button>
      <button onClick={sendMessageHandler}>Enviar mensaje</button>
      <button onClick={getRoster}>Obtener contactos</button>
      <button onClick={addContactHandler}>Añadir contacto</button>
      <button onClick={handleDeleteAccount}>Eliminar cuenta</button>
      <button onClick={handleJoinRoom}>Unirse a sala</button>
      <button onClick={handleSendRoomMessage}>Enviar mensaje a sala</button>
      <button onClick={handleGetUserData}>Obtener datos de usuario</button>
      <button onClick={handleDownloadFile}>Descargar archivo</button>
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

      <h3>Modificar estado</h3>
      <select onChange={(e) => changeState(e.target.value, prompt("Estado"))}>
        {
          Object.values(presenceShowValues).map((value, i) => (
            <option key={i} value={value}>{value}</option>
          ))
        }
        </select>

        <h3>Subir archivos</h3>
        <input type="file" onChange={handleFileChange} />
      <button onClick={handleSendFile}>Send File</button>
    </div>
  );
}

export default ChatPage;

ChatPage.propTypes = {

};