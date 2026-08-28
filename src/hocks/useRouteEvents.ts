import {
    useQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import {
    fetchTodayEvents,
    fetchDriverEvents,
    fetchLastOdometer,
    createRouteEvent,
    deleteRouteEvent,
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
                queryKey: ["lastOdometer", newEvent.carId],
            });
        },
    });
}

export function useDriverEvents(carId: number) {
    return useQuery({
        queryKey: ["route-events", carId, "all"],
        queryFn: () => fetchDriverEvents(carId),
        enabled: !!carId,
    });
}

// Видалення події (напр. зайва/помилково відскановна накладна) — carId
// передаємо окремо, бо DELETE не повертає видалений об'єкт
export function useDeleteRouteEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id }: { id: number; carId: number }) => deleteRouteEvent(id),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["route-events", variables.carId] });
            queryClient.invalidateQueries({ queryKey: ["lastOdometer", variables.carId] });
        },
    });
}