import { useQuery } from "@tanstack/react-query";
import { fetchCurrentDriver } from "../api/drivers";

export function useCurrentDriver() {
	return useQuery({ queryKey: ["drivers", "me"], queryFn: fetchCurrentDriver });
}
