import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCarrierCosts, createCarrierCost } from "../api/carrierCosts";
import type { CarrierCostPayload } from "../api/carrierCosts";

export function useCarrierCosts() {
	return useQuery({ queryKey: ["carrier-costs"], queryFn: fetchCarrierCosts });
}

export function useCreateCarrierCost() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CarrierCostPayload) => createCarrierCost(data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["carrier-costs"] }),
	});
}
