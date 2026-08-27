import type {
    Car,
    CarSpecs,
    TrackingMode,
    CarStatus,
    Trailer,
} from "../types";
import {
    USE_MOCK,
    mockDelay,
    apiFetch,
} from "./config.ts";
import mockCars from "../mocks/cars.json";

interface Paginated<T> {
    results: T[];
}

// Форма відповіді бекенду (snake_case) — окремо від camelCase TS-типів вище.
interface RawCarSpecs {
    vin_code?: string;
    year_manufactured?: number;
    weight_kg?: string;
    payload_kg?: string;
    length_cm?: string;
    width_cm?: string;
    height_cm?: string;
    has_tail_lift: boolean;
    has_trailer: boolean;
}

interface RawTrailer {
    vin_code?: string;
    year_manufactured?: number;
    name_trailer: string;
    model: string;
    number_trailer: string;
    is_active: boolean;
}

interface RawCar {
    id: number;
    name_car: string;
    number_car: string;
    fuel_card_number?: number;
    amount_car: string;
    default_tracking_mode: TrackingMode;
    status_car: CarStatus;
    is_active: boolean;
    specs?: RawCarSpecs | null;
    trailer?: RawTrailer | null;
}

function mapCarSpecs(raw: RawCarSpecs, carId: number): CarSpecs {
    return {
        idCar: carId,   // CarSpecsSerializer виключає id/car — переюзаємо id авто
        vinCode: raw.vin_code,
        yearManufactured: raw.year_manufactured,
        // DRF серіалізує DecimalField як рядок у JSON — тому Number(...)
        weightKg: raw.weight_kg ? Number(raw.weight_kg) : undefined,
        payloadKg: raw.payload_kg ? Number(raw.payload_kg) : undefined,
        lengthCm: raw.length_cm ? Number(raw.length_cm) : undefined,
        widthCm: raw.width_cm ? Number(raw.width_cm) : undefined,
        heightCm: raw.height_cm ? Number(raw.height_cm) : undefined,
        hasTailLift: raw.has_tail_lift,
        hasTrailer: raw.has_trailer,
    };
}

function mapTrailer(raw: RawTrailer, carId: number): Trailer {
    return {
        idTrailer: carId,
        vinCode: raw.vin_code,
        yearManufactured: raw.year_manufactured,
        nameTrailer: raw.name_trailer,
        idCar: carId,
        model: raw.model,
        numberTrailer: raw.number_trailer,
        isActive: raw.is_active,
    };
}

function mapCar(raw: RawCar): Car {
    return {
        idCar: raw.id,
        nameCar: raw.name_car,
        numberCar: raw.number_car,
        fuelCardNumber: raw.fuel_card_number ?? undefined,
        amountCar: Number(raw.amount_car),
        defaultTrackingMode: raw.default_tracking_mode,
        statusCar: raw.status_car,
        isActive: raw.is_active,
        specs: raw.specs ? mapCarSpecs(raw.specs, raw.id) : undefined,
        trailer: raw.trailer ? mapTrailer(raw.trailer, raw.id) : undefined,
    };
}

// Отримати список всіх авто
export async function fetchCars(): Promise<Car[]> {
    if (USE_MOCK) {
        await mockDelay();
        // as Car[] — явне приведення типу (TypeScript довіряємо що JSON відповідає типу)
        return mockCars as Car[];
    }
    const data = await apiFetch<Paginated<RawCar>>("/cars/");
    return data.results.map(mapCar);
}

// Отримати одне авто по id
export async function fetchCar(id: number): Promise<Car> {
    if (USE_MOCK) {
        await mockDelay();
        const car = (mockCars as Car[]).find(c => c.idCar === id);
        if (!car) throw  new Error(`Авто #${id} не знайдено`);
        return car;
    }
    const  raw =await apiFetch<RawCar>(`/cars/${id}/`);
    return mapCar(raw);
}

export interface CarPayload {
    nameCar: string;
    numberCar: string;
    fuelCardNumber?: number;
    amountCar: number;
    defaultTrackingMode: TrackingMode;
    statusCar: CarStatus;
    isActive: boolean;
    specs?: {
        vinCode?: string;
        yearManufactured?: number;
        weightKg?: number;
        payloadKg?: number;
        lengthCm?: number;
        widthCm?: number;
        heightCm?: number;
        hasTailLift: boolean;
        hasTrailer: boolean;
    };
    trailer?: {
        vinCode?: string;
        yearManufactured?: number;
        nameTrailer: string;
        model: string;
        numberTrailer: string;
        isActive: boolean;
    };
}

function toCarPayload(data: CarPayload) {
    return {
        name_car: data.nameCar,
        number_car: data.numberCar,
        fuel_card_number: data.fuelCardNumber ?? null,
        amount_car: data.amountCar,
        default_tracking_mode: data.defaultTrackingMode,
        status_car: data.statusCar,
        is_active: data.isActive,
        ...(data.specs && {
            specs: {
                vin_code: data.specs.vinCode ?? "",
                year_manufactured: data.specs.yearManufactured ?? null,
                weight_kg: data.specs.weightKg ?? null,
                payload_kg: data.specs.payloadKg ?? null,
                length_cm: data.specs.lengthCm ?? null,
                width_cm: data.specs.widthCm ?? null,
                height_cm: data.specs.heightCm ?? null,
                has_tail_lift: data.specs.hasTailLift,
                has_trailer: data.specs.hasTrailer,
            },
        }),
        ...(data.trailer && {
            trailer: {
                vin_code: data.trailer.vinCode ?? "",
                year_manufactured: data.trailer.yearManufactured ?? null,
                name_trailer: data.trailer.nameTrailer,
                model: data.trailer.model,
                number_trailer: data.trailer.numberTrailer,
                is_active: data.trailer.isActive,
            },
        }),
    };
}

export async function createCar(data: CarPayload): Promise<Car> {
    const raw = await apiFetch<RawCar>("/cars/", { method: "POST", json: toCarPayload(data) });
    return mapCar(raw);
}

export async function updateCar(id: number, data: CarPayload): Promise<Car> {
    const raw = await apiFetch<RawCar>(`/cars/${id}/`, { method: "PATCH", json: toCarPayload(data) });
    return mapCar(raw);
}

export async function deleteCar(id: number): Promise<void> {
    await apiFetch<void>(`/cars/${id}/`, { method: "DELETE" });
}
