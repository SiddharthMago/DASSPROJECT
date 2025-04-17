import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function AuthHandler() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	useEffect(() => {
		const token = searchParams.get("token");
		if (token) {
			localStorage.setItem("token", token);

			// Decode role
			try {
				const { role } = JSON.parse(atob(token.split(".")[1]));
				if (role === "admin" || role === "user" || role === "superadmin") {
					navigate(`/${role}/home`);
				} else {
					navigate("/user/home");
				}
			} catch {
				navigate("/user/home");
			}
		} else {
			navigate("/user/home");
		}
	}, []);

	return <div>Logging you in...</div>;
}

export default AuthHandler;
