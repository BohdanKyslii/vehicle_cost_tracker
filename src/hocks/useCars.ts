import { useQuery} from "@tanstack/react-query";
import { fetchCars, fetchCar} from "../api/cars.ts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCar, updateCar, deleteCar } from "../api/cars.ts";
import type { CarPayload } from "../api/cars.ts";

// useQuery приймає об'єкт з двома обов'язковими полями:
// queryKey — унікальний ключ для кешу (масив)
// queryFn  — async функція що повертає дані

export function useCars() {
    return useQuery({
        queryKey: ["cars"],
        queryFn: fetchCars,
    });
}

export function useCar(id: number) {
    return useQuery({
        queryKey: ["cars", id],   // кеш-ключ: ["cars", 1] — унікальний per-id
        queryFn: () => fetchCar(id),
        enabled: !!id,  // !! перетворює у boolean; не запускаємо якщо id = 0
    });
}

export function useCreateCar() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CarPayload) => createCar(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cars"] }),
    });
}

export function useUpdateCar(id: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CarPayload) => updateCar(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cars"] });
            queryClient.invalidateQueries({ queryKey: ["cars", id] });
        },
    });
}

export function useDeleteCar() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteCar(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cars"] }),
    });
}
