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
    updateRouteEvent,
} from "../api/routeEvents.ts";
import type {
    RouteEventCreate
} from "../types";
import type { RouteEventPatch } from "../api/routeEvents.ts";

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
        // onSuccess викликається після успішного запиту. ПОВЕРТАЄМО
        // Promise.all — без return mutateAsync() резолвиться одразу після
        // POST, не чекаючи на реальне оновлення кешу todayEvents. Це
        // давало вікно гонки: водій одразу відкриває наступний скан,
        // а дублікат-гард (EventForm) ще бачить СТАРИЙ todayEvents без
        // щойно збереженої накладної — повторний скан тієї самої
        // накладної проходив, хоча мав блокуватись.
        onSuccess: (newEvent) => {
           return Promise.all([
              queryClient.invalidateQueries({ queryKey: ["route-events", newEvent.carId] }),
              queryClient.invalidateQueries({ queryKey: ["lastOdometer", newEvent.carId] }),
           ]);
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
            return Promise.all([
                queryClient.invalidateQueries({ queryKey: ["route-events", variables.carId] }),
                queryClient.invalidateQueries({ queryKey: ["lastOdometer", variables.carId] }),
            ]);
        },
    });
}

// Виправлення помилково відсканованої накладної (номер/дата/клієнт,
// за наявності — одометр/палети) без повторного сканування з нуля
export function useUpdateRouteEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, patch }: { id: number; carId: number; patch: RouteEventPatch }) => updateRouteEvent(id, patch),
        onSuccess: (_data, variables) => {
            return queryClient.invalidateQueries({ queryKey: ["route-events", variables.carId] });
        },
    });
}