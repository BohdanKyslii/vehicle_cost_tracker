import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	fetchMonthlyCosts,
	fetchMonthlyCost,
	createMonthlyCost,
	updateMonthlyCost,
	deleteMonthlyCost,
} from "../api/monthlyCosts";
import type { MonthlyCostsPayload } from "../api/monthlyCosts";

export function useMonthlyCostsList(carId?: number) {
	return useQuery({
		queryKey: ["monthly-costs", carId ?? "all"],
		queryFn: () => fetchMonthlyCosts(carId),
	});
}

export function useMonthlyCost(id: number) {
	return useQuery({
		queryKey: ["monthly-costs", "one", id],
		queryFn: () => fetchMonthlyCost(id),
		enabled: !!id,
	});
}

export function useCreateMonthlyCost() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: MonthlyCostsPayload) => createMonthlyCost(data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["monthly-costs"] }),
	});
}

export function useUpdateMonthlyCost(id: number) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: MonthlyCostsPayload) => updateMonthlyCost(id, data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["monthly-costs"] }),
	});
}

export function useDeleteMonthlyCost() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => deleteMonthlyCost(id),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["monthly-costs"] }),
	});
}

// id окремо від аргументів хука — той самий call-time патерн, що
// useAttachWaybillToHiredTrip (Фаза 18): масове введення (BulkMonthlyCostsForm)
// зберігає по кілька різних авто за один сабміт, частину як create, частину
// як update — одному хук-виклику це не прив'язати заздалегідь до одного id
export function useSaveMonthlyCost() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id?: number; data: MonthlyCostsPayload }) =>
			id ? updateMonthlyCost(id, data) : createMonthlyCost(data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["monthly-costs"] }),
	});
}
