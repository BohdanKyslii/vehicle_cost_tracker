import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	fetchCustomers,
	fetchCustomer,
	createCustomer,
	updateCustomer,
	fetchStores,
	fetchStore,
	createStore,
	updateStore,
} from "../api/customers";
import type { CustomerPayload, StorePayload } from "../api/customers";

export function useCustomers(search = "") {
	return useQuery({ queryKey: ["customers", search], queryFn: () => fetchCustomers(search) });
}

export function useCustomer(id: number) {
	return useQuery({
		queryKey: ["customers", "detail", id],
		queryFn: () => fetchCustomer(id),
		enabled: !!id,
	});
}

export function useCreateCustomer() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CustomerPayload) => createCustomer(data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
	});
}

export function useUpdateCustomer(id: number) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Omit<CustomerPayload, "idCustomer">) => updateCustomer(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["customers"] });
			queryClient.invalidateQueries({ queryKey: ["customers", "detail", id] });
		},
	});
}

export function useStores(search = "") {
	return useQuery({ queryKey: ["stores", search], queryFn: () => fetchStores(search) });
}

export function useStore(id: number) {
	return useQuery({
		queryKey: ["stores", "detail", id],
		queryFn: () => fetchStore(id),
		enabled: !!id,
	});
}

export function useCreateStore() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: StorePayload) => createStore(data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["stores"] }),
	});
}

export function useUpdateStore(id: number) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Omit<StorePayload, "idStore">) => updateStore(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["stores"] });
			queryClient.invalidateQueries({ queryKey: ["stores", "detail", id] });
		},
	});
}
