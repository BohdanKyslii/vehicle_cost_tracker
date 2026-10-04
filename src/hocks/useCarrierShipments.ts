import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	fetchCarrierShipments,
	fetchCarrierShipment,
	createCarrierShipment,
	updateCarrierShipment,
	deleteCarrierShipment,
	attachWaybillToCarrierShipment,
	detachWaybillFromCarrierShipment,
	fetchCarrierShipmentReview,
} from "../api/carrierShipments";
import type { CarrierShipmentPayload } from "../api/carrierShipments";
import type { CarrierCode } from "../types";

export function useCarrierShipments() {
	return useQuery({ queryKey: ["carrier-shipments"], queryFn: fetchCarrierShipments });
}

export function useCarrierShipment(id: number) {
	return useQuery({
		queryKey: ["carrier-shipments", id],
		queryFn: () => fetchCarrierShipment(id),
		enabled: !!id,
	});
}

export function useCreateCarrierShipment() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CarrierShipmentPayload) => createCarrierShipment(data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["carrier-shipments"] }),
	});
}

export function useUpdateCarrierShipment(id: number) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CarrierShipmentPayload) => updateCarrierShipment(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["carrier-shipments"] });
			queryClient.invalidateQueries({ queryKey: ["carrier-shipments", id] });
		},
	});
}

export function useDeleteCarrierShipment() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => deleteCarrierShipment(id),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["carrier-shipments"] }),
	});
}

// id окремо від аргументів хука — той самий call-time патерн, що
// useAttachWaybillToHiredTrip
export function useAttachWaybillToCarrierShipment() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, waybillNumber }: { id: number; waybillNumber: string }) =>
			attachWaybillToCarrierShipment(id, waybillNumber),
		onSuccess: (_data, { id }) => {
			queryClient.invalidateQueries({ queryKey: ["carrier-shipments"] });
			queryClient.invalidateQueries({ queryKey: ["carrier-shipments", id] });
		},
	});
}

export function useDetachWaybillFromCarrierShipment() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, waybillNumber }: { id: number; waybillNumber: string }) =>
			detachWaybillFromCarrierShipment(id, waybillNumber),
		onSuccess: (_data, { id }) => {
			queryClient.invalidateQueries({ queryKey: ["carrier-shipments"] });
			queryClient.invalidateQueries({ queryKey: ["carrier-shipments", id] });
		},
	});
}

// Ключ під ["carrier-shipments"] — будь-яка мутація відправлень, що
// інвалідує цей префікс, оновлює й звірку
export function useCarrierShipmentReview(carrier?: CarrierCode) {
	return useQuery({
		queryKey: ["carrier-shipments", "review", carrier ?? "all"],
		queryFn: () => fetchCarrierShipmentReview(carrier),
	});
}
