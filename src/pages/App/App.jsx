import { SessionProvider } from '../../context/SessionContext';
import { BrowserRouter as Router } from 'react-router-dom';
import IndexPage from '../IndexPage/IndexPage';



  function App() {

    return (
      <SessionProvider>
      <Router>

        <IndexPage />

      </Router>
    </SessionProvider>
    )
  }

  export default App
