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
