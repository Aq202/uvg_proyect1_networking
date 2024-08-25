import { Route, Routes } from "react-router-dom";
import LoginPage from "../LoginPage/LoginPage";
import useSession from "../../hooks/useSession";
import ChatPage from "../ChatPage/ChatPage";
import RegisterPage from "../RegisterPage/RegisterPage";

function IndexPage() {
	const {session} = useSession();

	let routes = null;

	if (session === null) {
		routes = 	<Routes>
								<Route path="/register" element={<RegisterPage />} />
								<Route path="*" element={<LoginPage />} />
							</Routes>;
	} else if (session !== undefined) {
		routes = 	<Routes>
								<Route path="*" element={<ChatPage />} />
							</Routes>
	}
	return (
		routes
	);
}

export default IndexPage;
