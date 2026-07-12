import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { fetchCurrentUser, login, register, logout } from "../api/auth";

export function useCurrentUser() {
	const queryClient = useQueryClient();
	
	const query = useQuery({
		queryKey: ["currentUser"],
		queryFn: async () => (await fetchCurrentUser()).user,
	});
	
	// onSuccess тут не типовий React Query API — оновлюємо кеш вручну
	// одразу після успішного логіну/реєстрації, щоб не чекати refetch
	const loginMutation = useMutation({
		mutationFn: ({ username, password }: { username: string; password: string }) =>
			login(username, password),
		onSuccess: (user) => queryClient.setQueryData(["currentUser"], user),
	});
	
	// Без onSuccess на currentUser — реєстрація не створює сесію,
	// акаунт чекає на підтвердження адміністратором.
	const registerMutation = useMutation({
		mutationFn: ({ username, email, password, role }: { username: string; email: string; password: string; role: string }) =>
			register(username, email, password, role),
	});
	
	const logoutMutation = useMutation({
		mutationFn: logout,
		onSuccess: () => queryClient.setQueryData(["currentUser"], null),
	});
	
	return {
		user: query.data,
		isLoading: query.isLoading,
		login: loginMutation.mutateAsync,
		register: registerMutation.mutateAsync,
		logout: logoutMutation.mutateAsync,
		loginError: loginMutation.error,
		registerError: registerMutation.error,
		logoutError: logoutMutation.error,
	};
}