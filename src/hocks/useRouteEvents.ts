import {
    useQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import {
    fetchTodayEvents,
    fetchDriverEvents,
    fetchAllRouteEvents,
    fetchRouteEvent,
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
              // Увесь префікс "route-events", не лише [.., newEvent.carId] —
              // адмінський список /panel/events (ключ ["route-events","admin",...])
              // теж мусить побачити щойно створену подію, не тільки водійський
              // useTodayEvents/useDriverEvents по конкретному авто.
              queryClient.invalidateQueries({ queryKey: ["route-events"] }),
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

// Усі події всіх водіїв/авто (адмінка /panel/events) — ключ навмисно НЕ
// починається з ["route-events", carId], тому мутації нижче інвалідують
// ["route-events"] цілим префіксом, а не по конкретному carId, — інакше
// правка з адмінки не оновила б цей список і навпаки
export function useAllRouteEvents(filters: { date?: string; carId?: number } = {}, options: { enabled?: boolean } = {}) {
    return useQuery({
        queryKey: ["route-events", "admin", filters],
        queryFn: () => fetchAllRouteEvents(filters),
        enabled: options.enabled ?? true,
    });
}

export function useRouteEvent(id: number) {
    return useQuery({
        queryKey: ["route-events", "detail", id],
        queryFn: () => fetchRouteEvent(id),
        enabled: !!id,
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
                queryClient.invalidateQueries({ queryKey: ["route-events"] }),
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
            return Promise.all([
                queryClient.invalidateQueries({ queryKey: ["route-events"] }),
                queryClient.invalidateQueries({ queryKey: ["lastOdometer", variables.carId] }),
                // Адмінська форма могла перепризначити подію іншому авто —
                // інвалідувати одометр і нового carId теж, якщо він змінився
                ...(variables.patch.carId != null && variables.patch.carId !== variables.carId
                    ? [queryClient.invalidateQueries({ queryKey: ["lastOdometer", variables.patch.carId] })]
                    : []),
            ]);
        },
    });
}