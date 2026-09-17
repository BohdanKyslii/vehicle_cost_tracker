import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { keepPreviousData } from "@tanstack/react-query";
import {
    fetchWaybills,
    fetchWaybillDetail,
    checkWaybillChannel,
    fetchUnassignedWaybills,
    assignWaybillChannel,
    fetchAllOwnWaybillSummaries,
} from "../api/waybills";
import type {
    WaybillFilters,
    SortParams,
    PaginationParams
} from "../types";
import type { AssignChannelPayload } from "../api/waybills";

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

// Для аналітики — усі накладні каналу "own" за період (не одна сторінка UI)
export function useAllOwnWaybillSummaries(dateFrom: string, dateTo: string) {
    return useQuery({
        queryKey: ["waybills-own-all", dateFrom, dateTo],
        queryFn: () => fetchAllOwnWaybillSummaries(dateFrom, dateTo),
        enabled: !!dateFrom && !!dateTo,
    });
}

export function useUnassignedWaybills() {
    return useQuery({
        queryKey: ["waybills-unassigned"],
        queryFn: fetchUnassignedWaybills,
    });
}

export function useAssignWaybillChannel(waybillNumber: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: AssignChannelPayload) => assignWaybillChannel(waybillNumber, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["waybill-detail", waybillNumber] });
            queryClient.invalidateQueries({ queryKey: ["waybill-channel", waybillNumber] });
            queryClient.invalidateQueries({ queryKey: ["waybills"] });
            queryClient.invalidateQueries({ queryKey: ["waybills-unassigned"] });
        },
    });
}
