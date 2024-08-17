import { Route, Routes } from "react-router-dom";
import LoginPage from "../LoginPage/LoginPage";

function IndexPage() {
	return (
		<Routes>
			<Route
				path="/"
				element={<LoginPage />}
			/>
		</Routes>
	);
}

export default IndexPage;
