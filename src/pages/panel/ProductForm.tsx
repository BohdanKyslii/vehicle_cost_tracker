import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProduct, useCreateProduct, useUpdateProduct } from "../../hocks/useProducts";
import { useProductCategories, useCreateProductCategory } from "../../hocks/useProducts";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import type { ProductPayload } from "../../api/products";

export function ProductForm() {
	const { productId } = useParams();
	const navigate = useNavigate();
	const isEdit = !!productId;
	const { data: existing } = useProduct(isEdit ? Number(productId) : 0);
	const { data: categories } = useProductCategories();

	const [idProduct, setIdProduct] = useState(String(existing?.idProduct ?? ""));
	const [nameProduct, setNameProduct] = useState(existing?.nameProduct ?? "");
	const [category, setCategory] = useState<number | "">(existing?.category ?? "");
	const [description, setDescription] = useState(existing?.description ?? "");
	const [isActive, setIsActive] = useState(existing?.isActive ?? true);

	const [unitWeightKg, setUnitWeightKg] = useState(String(existing?.logistics?.unitWeightKg ?? ""));
	const [unitLengthCm, setUnitLengthCm] = useState(String(existing?.logistics?.unitLengthCm ?? ""));
	const [unitWidthCm, setUnitWidthCm] = useState(String(existing?.logistics?.unitWidthCm ?? ""));
	const [unitHeightCm, setUnitHeightCm] = useState(String(existing?.logistics?.unitHeightCm ?? ""));
	const [unitsPerBox, setUnitsPerBox] = useState(String(existing?.logistics?.unitsPerBox ?? ""));

	const [newCategoryName, setNewCategoryName] = useState("");

	// Дані товару змінюються рідко (артикул/назва/категорія) — той самий
	// локед-режим, що CarForm/HiredTripForm/CarrierShipmentForm
	const [isEditingDetails, setIsEditingDetails] = useState(false);
	const detailsLocked = isEdit && !isEditingDetails;

	const createProduct = useCreateProduct();
	const updateProduct = useUpdateProduct(Number(productId));
	const createCategory = useCreateProductCategory();
	const mutation = isEdit ? updateProduct : createProduct;

	function handleSubmit(e: FormEvent) {
		e.preventDefault();
		const logistics = {
			unitWeightKg: unitWeightKg ? Number(unitWeightKg) : undefined,
			unitLengthCm: unitLengthCm ? Number(unitLengthCm) : undefined,
			unitWidthCm: unitWidthCm ? Number(unitWidthCm) : undefined,
			unitHeightCm: unitHeightCm ? Number(unitHeightCm) : undefined,
			unitsPerBox: unitsPerBox ? Number(unitsPerBox) : undefined,
		};
		if (isEdit) {
			updateProduct.mutate(
				{ nameProduct, category: category === "" ? null : category, description, isActive, logistics },
				{ onSuccess: () => navigate("/panel/products") },
			);
		} else {
			const payload: ProductPayload = {
				idProduct: Number(idProduct),
				nameProduct,
				category: category === "" ? null : category,
				description,
				isActive,
				logistics,
			};
			createProduct.mutate(payload, { onSuccess: () => navigate("/panel/products") });
		}
	}

	function handleAddCategory() {
		if (!newCategoryName.trim()) return;
		createCategory.mutate(
			{ nameCategory: newCategoryName.trim(), parent: null },
			{
				onSuccess: (created) => {
					setCategory(created.id);
					setNewCategoryName("");
				},
			},
		);
	}

	return (
		<div className="p-6 max-w-lg mx-auto space-y-4">
			<form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-6">
				<div className="flex items-center justify-between">
					<h1 className="text-xl font-bold text-white">{isEdit ? "Товар" : "Новий товар"}</h1>
					{isEdit && !isEditingDetails && (
						<Button type="button" variant="ghost" onClick={() => setIsEditingDetails(true)}>
							✏️ Редагувати
						</Button>
					)}
				</div>

				<Input
					label="Артикул (1С)"
					type="number"
					value={idProduct}
					onChange={(e) => setIdProduct(e.target.value)}
					required
					disabled={isEdit}
					helpText={isEdit ? "Артикул не можна змінити після створення" : undefined}
				/>
				<Input label="Назва" value={nameProduct} onChange={(e) => setNameProduct(e.target.value)} required disabled={detailsLocked} />

				<div className="flex flex-col gap-1">
					<label className="text-sm font-medium text-white/70">Категорія</label>
					<select
						value={category}
						onChange={(e) => setCategory(e.target.value ? Number(e.target.value) : "")}
						disabled={detailsLocked}
						className="w-full rounded-lg border border-white/10 bg-white/5 text-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 [&>option]:bg-slate-900 [&>option]:text-white"
					>
						<option value="">— без категорії —</option>
						{categories?.map((c) => (
							<option key={c.id} value={c.id}>
								{c.parentName ? `${c.parentName} → ${c.nameCategory}` : c.nameCategory}
							</option>
						))}
					</select>
				</div>

				{!detailsLocked && (
					<div className="flex gap-2 items-end">
						<Input label="Нова категорія" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="flex-1" />
						<Button type="button" variant="secondary" size="sm" onClick={handleAddCategory} isLoading={createCategory.isPending}>
							+ Додати
						</Button>
					</div>
				)}

				<Input label="Опис" value={description} onChange={(e) => setDescription(e.target.value)} disabled={detailsLocked} />

				<label className="flex items-center gap-2 text-sm text-white/70">
					<input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} disabled={detailsLocked} />
					Товар активний
				</label>

				<h2 className="text-lg font-semibold text-white pt-2">Логістика (одиниця товару)</h2>
				<div className="grid grid-cols-2 gap-3">
					<Input label="Вага (кг)" type="number" value={unitWeightKg} onChange={(e) => setUnitWeightKg(e.target.value)} disabled={detailsLocked} />
					<Input label="Одиниць у ящику" type="number" value={unitsPerBox} onChange={(e) => setUnitsPerBox(e.target.value)} disabled={detailsLocked} />
				</div>
				<div className="grid grid-cols-3 gap-2">
					<Input label="Довжина (см)" type="number" value={unitLengthCm} onChange={(e) => setUnitLengthCm(e.target.value)} disabled={detailsLocked} />
					<Input label="Ширина (см)" type="number" value={unitWidthCm} onChange={(e) => setUnitWidthCm(e.target.value)} disabled={detailsLocked} />
					<Input label="Висота (см)" type="number" value={unitHeightCm} onChange={(e) => setUnitHeightCm(e.target.value)} disabled={detailsLocked} />
				</div>

				{(mutation.isError || createCategory.isError) && (
					<ErrorBanner message={((mutation.error ?? createCategory.error) as Error).message} />
				)}

				<div className="flex gap-3">
					<Button type="button" variant="ghost" onClick={() => navigate("/panel/products")}>
						{detailsLocked ? "← Назад" : "Скасувати"}
					</Button>
					<Button type="submit" isLoading={mutation.isPending} className="flex-1">Зберегти</Button>
				</div>
			</form>
		</div>
	);
}
