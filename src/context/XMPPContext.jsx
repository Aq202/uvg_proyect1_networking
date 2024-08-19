import { createContext, useState, useEffect } from 'react';
import { Strophe } from 'strophe.js';
import PropTypes from 'prop-types';
import consts from '../utils/consts';


const XMPPContext = createContext();

export const XMPPProvider = ({ children }) => {

    const [connection, setConnection] = useState(null);
	const [subscriptionRequests, setSubscriptionRequests] = useState([]); 
    const [userStates, setUserStates] = useState({});
    const [rooms, setRooms] = useState({});


    useEffect(() => {
        const conn = new Strophe.Connection(`ws://${consts.serverDomain}:${consts.serverPort}/ws`);
        setConnection(conn);
    }, []);
    
    const data = {
        connection,
        subscriptionRequests,
        rooms,
        setRooms,
        setSubscriptionRequests,
        userStates,
        setUserStates,
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
