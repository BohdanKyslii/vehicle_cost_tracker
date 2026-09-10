import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
	useProductCategory,
	useProductCategories,
	useCreateProductCategory,
	useUpdateProductCategory,
} from "../../hocks/useProducts";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { ErrorBanner } from "../../components/ui/ErrorBanner";

export function CategoryForm() {
	const { categoryId } = useParams();
	const navigate = useNavigate();
	const isEdit = !!categoryId;
	const { data: existing } = useProductCategory(isEdit ? Number(categoryId) : 0);
	const { data: categories } = useProductCategories();

	const [nameCategory, setNameCategory] = useState(existing?.nameCategory ?? "");
	const [parent, setParent] = useState<number | "">(existing?.parent ?? "");

	// Той самий локед-режим, що ProductForm/CarForm — картку категорії
	// відкривають переважно подивитись, редагують рідко
	const [isEditingDetails, setIsEditingDetails] = useState(false);
	const detailsLocked = isEdit && !isEditingDetails;

	const createCategory = useCreateProductCategory();
	const updateCategory = useUpdateProductCategory(Number(categoryId));
	const mutation = isEdit ? updateCategory : createCategory;

	function handleSubmit(e: FormEvent) {
		e.preventDefault();
		const payload = { nameCategory, parent: parent === "" ? null : parent };
		mutation.mutate(payload, { onSuccess: () => navigate("/panel/categories") });
	}

	// Категорія не може бути власним батьком (і, для простоти, не може мати
	// за батька одну зі своїх прямих дітей — повноцінну перевірку циклу на
	// довільну глибину бекенд і так відхилить, тут лише очевидний випадок)
	const parentOptions = (categories ?? []).filter((c) => c.id !== Number(categoryId));

	return (
		<div className="p-6 max-w-lg mx-auto space-y-4">
			<form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-6">
				<div className="flex items-center justify-between">
					<h1 className="text-xl font-bold text-white">{isEdit ? "Категорія" : "Нова категорія"}</h1>
					{isEdit && !isEditingDetails && (
						<Button type="button" variant="ghost" onClick={() => setIsEditingDetails(true)}>
							✏️ Редагувати
						</Button>
					)}
				</div>

				<Input label="Назва" value={nameCategory} onChange={(e) => setNameCategory(e.target.value)} required disabled={detailsLocked} />

				<div className="flex flex-col gap-1">
					<label className="text-sm font-medium text-white/70">Батьківська категорія</label>
					<select
						value={parent}
						onChange={(e) => setParent(e.target.value ? Number(e.target.value) : "")}
						disabled={detailsLocked}
						className="w-full rounded-lg border border-white/10 bg-white/5 text-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 [&>option]:bg-slate-900 [&>option]:text-white"
					>
						<option value="">— коренева категорія —</option>
						{parentOptions.map((c) => (
							<option key={c.id} value={c.id}>
								{c.parentName ? `${c.parentName} → ${c.nameCategory}` : c.nameCategory}
							</option>
						))}
					</select>
				</div>

				{mutation.isError && <ErrorBanner message={(mutation.error as Error).message} />}

				<div className="flex gap-3">
					<Button type="button" variant="ghost" onClick={() => navigate("/panel/categories")}>
						{detailsLocked ? "← Назад" : "Скасувати"}
					</Button>
					<Button type="submit" isLoading={mutation.isPending} className="flex-1">Зберегти</Button>
				</div>
			</form>
		</div>
	);
}
