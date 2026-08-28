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
    drivers_license: string;
    car: number | null;
    is_active: boolean;
}

function mapDriver(raw: RawDriver): Driver {
    return {
        idDriver: raw.id,
        nameDriver: raw.name_driver,
        phoneDriver: raw.phone || undefined,
        driversLicense: raw.drivers_license,
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

// Один водій по id — картка водія (FleetList → клік на водія, як для авто)
export async function fetchDriver(id: number): Promise<Driver> {
    if (USE_MOCK) {
        await mockDelay();
        const driver = (mockDrivers as Driver[]).find(d => d.idDriver === id);
        if (!driver) throw new Error(`Водія #${id} не знайдено`);
        return driver;
    }
    const raw = await apiFetch<RawDriver>(`/drivers/${id}/`);
    return mapDriver(raw);
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

export interface DriverPayload {
    nameDriver: string;
    phoneDriver?: string;
    driversLicense?: string;
    idCar: number | null;
    isActive: boolean;
}

function toDriverPayload(data: DriverPayload) {
    return {
        name_driver: data.nameDriver,
        phone: data.phoneDriver,
        drivers_license: data.driversLicense,
        car: data.idCar,
        is_active: data.isActive,
    }
}

export async function createDriver(data: DriverPayload): Promise<Driver> {
    const raw = await apiFetch<RawDriver>("/drivers/", { method: "POST", json: toDriverPayload(data) });
    return mapDriver(raw);
}

export async function updateDriver(id: number, data: DriverPayload): Promise<Driver> {
    const raw = await apiFetch<RawDriver>(`/drivers/${id}/`, { method: "PATCH", json: toDriverPayload(data) });
    return mapDriver(raw);
}

export async function deleteDriver(id: number): Promise<void> {
    await apiFetch<void>(`/drivers/${id}/`, { method: "DELETE" });
}
