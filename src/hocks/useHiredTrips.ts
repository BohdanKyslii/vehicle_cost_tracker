import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	fetchHiredTrips,
	fetchHiredTrip,
	createHiredTrip,
	updateHiredTrip,
	deleteHiredTrip,
	attachWaybillToHiredTrip,
} from "../api/hiredTrips";
import type { HiredTripPayload } from "../api/hiredTrips";

export function useHiredTrips() {
	return useQuery({ queryKey: ["hired-trips"], queryFn: fetchHiredTrips });
}

export function useHiredTrip(id: number) {
	return useQuery({
		queryKey: ["hired-trips", id],
		queryFn: () => fetchHiredTrip(id),
		enabled: !!id,
	});
}

export function useCreateHiredTrip() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: HiredTripPayload) => createHiredTrip(data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hired-trips"] }),
	});
}

export function useUpdateHiredTrip(id: number) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: HiredTripPayload) => updateHiredTrip(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["hired-trips"] });
			queryClient.invalidateQueries({ queryKey: ["hired-trips", id] });
		},
	});
}

export function useDeleteHiredTrip() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => deleteHiredTrip(id),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hired-trips"] }),
	});
}

// id окремо від аргументів хука — той самий call-time патерн, що
// useUpdateDriver (Фаза 16): id рейсу відомий лише в момент виклику
export function useAttachWaybillToHiredTrip() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, waybillNumber }: { id: number; waybillNumber: string }) =>
			attachWaybillToHiredTrip(id, waybillNumber),
		onSuccess: (_data, { id }) => {
			queryClient.invalidateQueries({ queryKey: ["hired-trips"] });
			queryClient.invalidateQueries({ queryKey: ["hired-trips", id] });
		},
	});
}
