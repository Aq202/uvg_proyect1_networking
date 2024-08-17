import { useContext } from 'react';
import XMPPContext from '../context/XMPPContext';
import { Strophe, $pres } from "strophe.js";



const useXMPP = () => {
    const connection = useContext(XMPPContext);
    if (connection === undefined) {
        throw new Error('useXMPP debe ser utilizado dentro de un XMPPProvider');
    }

    const status = {
        CONNECTING: Strophe.Status.CONNECTING,
        CONNECTED: Strophe.Status.CONNECTED,
        DISCONNECTED: Strophe.Status.DISCONNECTED,
        DISCONNECTING: Strophe.Status.DISCONNECTING,
        ATTACHED: Strophe.Status.ATTACHED,
        AUTHFAIL: Strophe.Status.AUTHFAIL,
        ERROR: Strophe.Status.ERROR,
        CONNFAIL: Strophe.Status.CONNFAIL,
        REDIRECT: Strophe.Status.REDIRECT,
    }

    const connect = (user, password, callback) => {
        connection.connect(user, password, callback);
    }

    const disconnect = () => {
        connection.disconnect();
    }

    const sendPresence = () => {
        connection.send($pres().tree()); // Enviar presencia al servidor
    }
    

    return {
        status,
        connection,
        connect,
        disconnect,
        sendPresence
    };
};

export default useXMPP;