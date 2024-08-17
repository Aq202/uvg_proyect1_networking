import { createContext, useState, useEffect } from 'react';
import { Strophe } from 'strophe.js';
import PropTypes from 'prop-types';
import consts from '../utils/consts';


const XMPPContext = createContext();

export const XMPPProvider = ({ children }) => {
    const [connection, setConnection] = useState(null);

    useEffect(() => {
        const conn = new Strophe.Connection(`ws://${consts.serverDomain}:${consts.serverPort}/ws`);
        setConnection(conn);
    }, []);
    

    return (
        <XMPPContext.Provider value={connection}>
            {children}
        </XMPPContext.Provider>
    );
};

export default XMPPContext;
XMPPProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
