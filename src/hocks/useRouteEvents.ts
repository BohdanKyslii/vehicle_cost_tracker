import {
    useQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import {
    fetchTodayEvents,
    fetchLastOdometer,
    createRouteEvent,
} from "../api/routeEvents.ts";
import type {
    RouteEventCreate
} from "../types";

export function useTodayEvents(carId: number) {
    return useQuery({
       queryKey: ["route-events", carId, "today"],
       queryFn: () => fetchTodayEvents(carId),
       enabled: !!carId,
       refetchInterval: 60_000, // автооновлення кожну хвилину
    });
}

export function useLastOdometer(carId: number) {
    return useQuery({
        queryKey: ["lastOdometer", carId],
        queryFn: () => fetchLastOdometer(carId),
        enabled: !!carId,
    });
}

// useMutation — для POST/PUT/DELETE запитів (змінюють дані)
export function useCreateRouteEvent() {
    // useQueryClient дає доступ до QueryClient для інвалідації кешу
    const queryClient = useQueryClient();

    return useMutation({
       mutationFn: (data: RouteEventCreate) => createRouteEvent(data),
        // onSuccess викликається після успішного запиту
        onSuccess: (newEvent) => {

           queryClient.invalidateQueries({
              queryKey: ["route-events", newEvent.carId],
           });
            queryClient.invalidateQueries({
                queryKey: ["last-odometer", newEvent.carId],
            });
        },
    });
}
