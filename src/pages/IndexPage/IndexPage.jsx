import { Route, Routes } from "react-router-dom";
import LoginPage from "../LoginPage/LoginPage";
import useSession from "../../hooks/useSession";
import ChatPage from "../ChatPage/ChatPage";

function IndexPage() {
	const {session} = useSession();

	let page = null;

	if (session === null) {
		page = <LoginPage />;
	} else if (session !== undefined) {
		page = <ChatPage />;
	}
	return (
		<Routes>
			<Route
				path="*"
				element={page}
			/>
		</Routes>
	);
}

export default IndexPage;
