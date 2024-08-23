window.global ||= window;

import ReactDOM from 'react-dom/client'
import App from './pages/App/App.jsx'
import './styles/index.css'

window.global = window

ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
)
