// src/api/waybillImport.ts
import type { ImportResult, LegalEntity } from "../types";
import { apiFetchMultipart } from "./config.ts";

interface RawImportResult {
	batch_id: string;
	imported: number;
	deleted?: number;
	dates?: string[];
	errors: { row: number; field: string; message: string }[];
}

function mapImportResult(raw: RawImportResult): ImportResult {
	return {
		batchId: raw.batch_id,
		imported: raw.imported,
		deleted: raw.deleted,
		dates: raw.dates,
		skipped: raw.errors.length,
		errors: raw.errors,
	};
}

// Бекенд сам парсить CSV (РУБІН) чи XLS (ЄСП/ОПТ) залежно від
// legalEntity — фронтенд лише передає файл, нічого не парсить сам
// (свідоме рішення плану: один парсер на бекенді, не два на двох мовах)
export async function uploadWaybillFile(legalEntity: LegalEntity, file: File): Promise<ImportResult> {
	const formData = new FormData();
	formData.append("legal_entity", legalEntity);
	formData.append("file", file);
	const raw = await apiFetchMultipart<RawImportResult>("/waybill-records/import_file/", formData);
	return mapImportResult(raw);
}
