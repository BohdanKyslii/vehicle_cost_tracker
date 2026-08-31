import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAdminUsers, updateAdminUser, rejectAdminUser, linkTelegramUser } from "../api/adminUsers";
import type { AdminUserPatch } from "../api/adminUsers";

export function useAdminUsers() {
	return useQuery({ queryKey: ["admin-users"], queryFn: fetchAdminUsers });
}

// id окремо від хука — та сама call-time схема, що useUpdateDriver: у списку
// користувачів одночасно можуть редагуватись різні рядки (роль/апрув)
export function useUpdateAdminUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: AdminUserPatch }) => updateAdminUser(id, data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
	});
}

export function useRejectAdminUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => rejectAdminUser(id),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
	});
}

export function useLinkTelegramUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, sourceUserId }: { id: number; sourceUserId: number }) => linkTelegramUser(id, sourceUserId),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
	});
}
