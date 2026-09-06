// src/pages/waybills/WaybillImportForm.tsx
import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useUploadWaybillFile } from "../../hocks/useWaybillImport";
import { Button } from "../../components/ui/Button";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import type { LegalEntity } from "../../types";

export function WaybillImportForm() {
	const navigate = useNavigate();
	const [legalEntity, setLegalEntity] = useState<LegalEntity | "">("");
	const [file, setFile] = useState<File | null>(null);
	const upload = useUploadWaybillFile();

	function handleSubmit(e: FormEvent) {
		e.preventDefault();
		if (!legalEntity || !file) return;
		upload.mutate({ legalEntity, file });
	}

	return (
		<div className="p-6">
			<form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 space-y-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
				<h1 className="text-xl font-bold text-white">Імпорт із 1С</h1>

				<div className="flex flex-col gap-1">
					<label className="text-sm font-medium text-white/70">Юридична особа</label>
					<select
						value={legalEntity}
						onChange={(e) => setLegalEntity(e.target.value as LegalEntity)}
						className="w-full rounded-lg border border-white/10 bg-white/5 text-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 [&>option]:bg-slate-900 [&>option]:text-white"
						required
					>
						<option value="">— оберіть —</option>
						<option value="Rubin">РУБІН (CSV)</option>
						<option value="ESP">ЄСП (XLS)</option>
						<option value="OPT">ОПТ (XLS)</option>
					</select>
				</div>

				<div className="flex flex-col gap-1">
					<label className="text-sm font-medium text-white/70">Файл вивантаження</label>
					<input
						type="file"
						accept=".csv,.xls"
						onChange={(e) => setFile(e.target.files?.[0] ?? null)}
						className="text-sm text-white/70 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-violet-600 file:text-white file:text-sm hover:file:bg-violet-500"
						required
					/>
				</div>

				{upload.isError && <ErrorBanner message={(upload.error as Error).message} />}

				{upload.isSuccess && (
					<div className="rounded-lg border border-white/10 p-4 space-y-2 text-sm">
						<p className="text-white">
							Імпортовано {upload.data.imported} рядків
							{upload.data.deleted != null && `, видалено старих: ${upload.data.deleted}`}.
						</p>
						{upload.data.dates && upload.data.dates.length > 0 && (
							<p className="text-white/50">Дати: {upload.data.dates.join(", ")}</p>
						)}
						{upload.data.errors.length > 0 && (
							<div className="space-y-1">
								<p className="text-amber-300">Рядки з помилками (пропущені):</p>
								<ul className="text-white/60 max-h-40 overflow-y-auto space-y-0.5">
									{upload.data.errors.map((err, i) => (
										<li key={i}>Рядок {err.row}, {err.field}: {err.message}</li>
									))}
								</ul>
							</div>
						)}
					</div>
				)}

				<div className="flex gap-3">
					<Button type="button" variant="ghost" onClick={() => navigate("/waybills")}>← Назад</Button>
					<Button type="submit" isLoading={upload.isPending} className="flex-1">Завантажити</Button>
				</div>
			</form>
		</div>
	);
}
