import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchDrivers, fetchCurrentDriver, updateDriver } from "../api/drivers";
import type { DriverPayload } from "../api/drivers";

export function useCurrentDriver() {
	return useQuery({ queryKey: ["drivers", "me"], queryFn: fetchCurrentDriver });
}

export function useDrivers() {
	return useQuery({ queryKey: ["drivers"], queryFn: fetchDrivers });
}

// id окремо від хуку (не в аргументах хуку) — той самий call-time патерн,
// що й у useDeleteCar: тут потрібно оновлювати то одного, то іншого водія
// (стара/нова прив'язка до авто) в межах одного handleSubmit
export function useUpdateDriver() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: DriverPayload }) => updateDriver(id, data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["drivers"] }),
	});
}
