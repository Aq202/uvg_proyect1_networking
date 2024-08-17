import { SessionProvider } from "../../context/SessionContext";
import { BrowserRouter as Router } from "react-router-dom";
import IndexPage from "../IndexPage/IndexPage";
import { XMPPProvider } from "../../context/XMPPContext";

function App() {
	return (
		<XMPPProvider>
			<SessionProvider>
				<Router>
					<IndexPage />
				</Router>
			</SessionProvider>
		</XMPPProvider>
	);
}

export default App;
