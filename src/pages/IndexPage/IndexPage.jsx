import { Route, Routes } from "react-router-dom";
import LoginPage from "../LoginPage/LoginPage";
import useSession from "../../hooks/useSession";
import ChatPage from "../ChatPage/ChatPage";
import ChatPageTest from "../ChatPage/ChatPageTest";

function IndexPage() {
	const {session} = useSession();

	let page = null;
	let testPage = null;

	if (session === null) {
		page = <LoginPage />;
		testPage = <LoginPage />
	} else if (session !== undefined) {
		page = <ChatPage />;
		testPage = <ChatPageTest />
	}
	return (
		<Routes>
			<Route
				path="/test"
				element={testPage}
			/>
			<Route
				path="*"
				element={page}
			/>
		</Routes>
	);
}

export default IndexPage;
