import { Navigate } from "react-router-dom";
import { useCurrentUser } from "../hocks/useCurrentUser";
import { LandingPage } from "./LandingPage";
import { ROLE_ROUTES } from "../utils/roleAccess";

export function RoleRedirect() {
	const {user, isLoading } = useCurrentUser();

	if (isLoading) return null;
	if (!user) return <LandingPage />;

	// Водій — одразу в мобільний екран; решта ролей — на перший дозволений
	// їм розділ офісного застосунку (ROLE_ROUTES) — не завжди /fleet,
	// бо тепер не всі офісні ролі мають туди доступ (напр. manager)
	if (user.profile?.role === "driver") return <Navigate to="/driver" replace />;
	const landing = user.profile ? ROLE_ROUTES[user.profile.role][0] : "/fleet";
	return <Navigate to={landing ?? "/fleet"} replace />;
}
