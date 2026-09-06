// src/hocks/useWaybillImport.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadWaybillFile } from "../api/waybillImport";
import type { LegalEntity } from "../types";

export function useUploadWaybillFile() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ legalEntity, file }: { legalEntity: LegalEntity; file: File }) =>
			uploadWaybillFile(legalEntity, file),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["waybills"] });
			queryClient.invalidateQueries({ queryKey: ["waybills-unassigned"] });
		},
	});
}
