import type { Driver } from "../types";
import { USE_MOCK, mockDelay, apiFetch} from "./config.ts";
import mockDrivers from "../mocks/drivers.json";

interface Paginated<T> {
    results: T[];
}

// DriverSerializer: id, name_driver, phone, car, car_number, car_name, is_active
interface RawDriver {
    id: number;
    name_driver: string;
    phone?: string;
    car: number | null;
    is_active: boolean;
}

function mapDriver(raw: RawDriver): Driver {
    return {
        idDriver: raw.id,
        nameDriver: raw.name_driver,
        phoneDriver: raw.phone || undefined,
        idCar: raw.car ?? null,
        isActive: raw.is_active,
    };
}

export async function fetchDrivers(): Promise<Driver[]> {
    if (USE_MOCK) {
        await mockDelay();
        return mockDrivers as Driver[];
    }
    const data = await apiFetch<Paginated<RawDriver>>("/drivers/");
    return data.results.map(mapDriver);
}

// Поточний водій — визначається бекендом по сесії (Profile.driver, apps/accounts)
export async function fetchCurrentDriver(): Promise<Driver> {
    if (USE_MOCK) {
        await mockDelay(100);
        const driver = (mockDrivers as Driver[]).find(d => d.isActive);
        if (!driver) throw new Error("Водія не знайдено");
        return driver;
    }
    const raw = await apiFetch<RawDriver>("/drivers/me/");
    return mapDriver(raw);
}
