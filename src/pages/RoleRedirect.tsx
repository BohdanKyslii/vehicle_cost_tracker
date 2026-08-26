import { Navigate } from "react-router-dom";
import { useCurrentUser } from "../hocks/useCurrentUser";
import { LandingPage } from "./LandingPage";

export function RoleRedirect() {
	const {user, isLoading } = useCurrentUser();
	
	if (isLoading) return null;
	if (!user) return <LandingPage />;
	
	// Водій — одразу в мобільний екран; решта ролей — в офісний застосунок
	return user.profile?.role === "driver"
	? <Navigate to="/driver" replace />
	: <Navigate to="/fleet" replace />;
}
