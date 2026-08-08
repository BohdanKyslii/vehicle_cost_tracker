import { useQuery} from "@tanstack/react-query";
import { fetchCars, fetchCar} from "../api/cars.ts";

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
