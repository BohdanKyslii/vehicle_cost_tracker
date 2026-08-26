import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useCurrentUser } from "../../hocks/useCurrentUser";
import type { UserProfile } from "../../api/auth";

interface RequireRoleProps {
  roles: UserProfile["role"][];
  children: ReactNode;
}

export function RequireRole({ roles, children }: RequireRoleProps) {
  const { user, isLoading } = useCurrentUser();
  
  if (isLoading) {
  return <div className="p-8 text-center text-white/40">Завантаження...</div>;
  }
	// Не залогинений — на лендінг, а не на 404
  if (!user) {
	  return <Navigate to="/" replace />;
  }
  if (!user.profile || !roles.includes(user.profile.role)) {
	  return (
		  <div className="p-8 text-center">
			  <h2 className="text-xl font-bold text-white">Доступ заборонено</h2>
			  <p className="mt-2 text-white/50">
				  Ваша роль ({user.profile?.role ?? "невідома"}) не має доступу
				  до цієї сторінки.
			  </p>
		  </div>
	  );
  }
  
  return <>{children}</>;
}
