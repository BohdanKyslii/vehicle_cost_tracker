import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export interface BulkImportError {
	row: number; // 1-based, як номер рядка в Excel (без заголовка)
	message: string;
}

export interface BulkImportResult {
	success: number;
	errors: BulkImportError[];
}

// Спільний хук для масового імпорту (Товари/Клієнти/Магазини, /panel) —
// послідовний цикл зі збором помилок по рядку, той самий підхід, що вже є
// в BulkMonthlyCostsForm.tsx::handleSave() (for + mutateAsync + мапа
// помилок), лише узагальнений під довільну сутність. Послідовно, не
// Promise.all — бекенд не має bulk-ендпоінту, паралельні POST на ту саму
// таблицю (Товари/Клієнти) не дають переваги і ускладнюють збір помилок
// по конкретному рядку.
export function useBulkImport<TRow>(createFn: (row: TRow) => Promise<unknown>, invalidateKey: unknown[]) {
	const queryClient = useQueryClient();
	const [isRunning, setIsRunning] = useState(false);

	async function run(rows: TRow[]): Promise<BulkImportResult> {
		setIsRunning(true);
		const errors: BulkImportError[] = [];
		let success = 0;
		for (let i = 0; i < rows.length; i++) {
			try {
				await createFn(rows[i]);
				success++;
			} catch (err) {
				errors.push({ row: i + 1, message: (err as Error).message });
			}
		}
		setIsRunning(false);
		await queryClient.invalidateQueries({ queryKey: invalidateKey });
		return { success, errors };
	}

	return { run, isRunning };
}
