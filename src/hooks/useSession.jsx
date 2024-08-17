import { useContext } from 'react';
import SessionContext from '../context/SessionContext';

function useLogin() {

  const { setSession } = useContext(SessionContext);

  
  const login = async ({
    user, password,
  }) => {
    
    const session = { user, password };
    window.localStorage.setItem('session', JSON.stringify(session));
    setSession(session);
  };

  const logout = () => {
    window.localStorage.removeItem('session');
    setSession(null);
  }


  return {
    login, logout,
  };
}
export default useLogin;
