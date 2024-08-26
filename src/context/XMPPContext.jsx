import { createContext, useState, useEffect } from 'react';
import { Strophe } from 'strophe.js';
import PropTypes from 'prop-types';
import consts from '../utils/consts';


const XMPPContext = createContext();

/**
 * XMPPProvider es un componente que proporciona el contexto XMPP a toda la aplicación.
 * Mantiene el estado de la conexión XMPP, así como otros estados relacionados como salas,
 * mensajes, estados de usuarios, etc.
 * 
 * @param {Object} props - Las propiedades que se pasan al proveedor.
 * @param {ReactNode} props.children - Los componentes hijos que se envolverán en el proveedor.
 */
export const XMPPProvider = ({ children }) => {

    const [userStatus, setUserStatus] = useState({});
    const [connection, setConnection] = useState(null);
	const [subscriptionRequests, setSubscriptionRequests] = useState([]); 
    const [userStates, setUserStates] = useState({});
    const [rooms, setRooms] = useState({});
    const [messages, setMessages] = useState({});
    const [roster, setRoster] = useState({});


    useEffect(() => {
        const conn = new Strophe.Connection(`ws://${consts.serverDomain}:${consts.serverPort}/ws`);
        setConnection(conn);
    }, []);
    
    const data = {
        connection,
        subscriptionRequests,
        rooms,
        messages,
        roster,
        userStates,
        userStatus,
        setRooms,
        setSubscriptionRequests,
        setUserStates,
        setMessages,
        setRoster,
        setUserStatus
    }

    return (
        <XMPPContext.Provider value={data}>
            {children}
        </XMPPContext.Provider>
    );
};

export default XMPPContext;
XMPPProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
