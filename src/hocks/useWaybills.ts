import { useQuery } from "@tanstack/react-query";
import { keepPreviousData } from "@tanstack/react-query";
import {
    fetchWaybills,
    fetchWaybillDetail,
    checkWaybillChannel,
    fetchUnassignedWaybills,
} from "../api/waybills";
import type {
    WaybillFilters,
    SortParams,
    PaginationParams
} from "../types";

export function useWaybills(
    filters: WaybillFilters,
    sort: SortParams,
    pagination: PaginationParams,
) {
    return useQuery({
        // queryKey включає всі параметри — при їх зміні → новий запит
        queryKey: ["waybills", filters, sort, pagination],
        queryFn: () => fetchWaybills(filters, sort, pagination),
        // keepPreviousData — при зміні сторінки показує старі дані поки грузяться нові
        // (без мигання порожнього стану)
        placeholderData: keepPreviousData,
    });
}

export function useWaybillDetail(waybillNumber: string) {
    return useQuery({
        queryKey: ["waybill-detail", waybillNumber],
        queryFn: () => fetchWaybillDetail(waybillNumber),
        enabled: !!waybillNumber,
    });
}

export function useCheckWaybillChannel(waybillNumber: string) {
    return useQuery({
        queryKey: ["waybill-channel", waybillNumber],
        queryFn: () => checkWaybillChannel(waybillNumber),
        enabled: !!waybillNumber,
    });
}

export function useUnassignedWaybills() {
    return useQuery({
        queryKey: ["waybills-unassigned"],
        queryFn: fetchUnassignedWaybills,
    });
}
