import {
  createContext, useState,
} from 'react';
import PropTypes from 'prop-types';

/**
 * @context SessionContext: Contexto de la sesión iniciada por el usuario.
 * session: objeto de la forma { user: string, password: string 
 * Si no hay sesión iniciada, el valor es null.
 * Si es undefined, es porque no se ha cargado la sesión desde localStorage.
 *
*/

const SessionContext = createContext();
function SessionProvider({ children }) {
  // null es que la sesión no existe
  const [session, setSession] = useState(undefined);

  
  const data = {
    session, setSession,
  };

  return <SessionContext.Provider value={data}>{children}</SessionContext.Provider>;
}

export { SessionProvider };
export default SessionContext;

SessionProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
