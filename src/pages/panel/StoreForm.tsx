import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore, useCreateStore, useUpdateStore } from "../../hocks/useCustomers";
import { useCustomers } from "../../hocks/useCustomers";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import type { StorePayload } from "../../api/customers";

export function StoreForm() {
	const { storeId } = useParams();
	const navigate = useNavigate();
	const isEdit = !!storeId;
	const { data: existing } = useStore(isEdit ? Number(storeId) : 0);
	const { data: customers } = useCustomers();

	const [idStore, setIdStore] = useState(String(existing?.idStore ?? ""));
	const [customer, setCustomer] = useState<number | "">(existing?.customer ?? "");
	const [nameStore, setNameStore] = useState(existing?.nameStore ?? "");
	const [storeAddress, setStoreAddress] = useState(existing?.storeAddress ?? "");
	const [isActive, setIsActive] = useState(existing?.isActive ?? true);

	const [isEditingDetails, setIsEditingDetails] = useState(false);
	const detailsLocked = isEdit && !isEditingDetails;

	const createStore = useCreateStore();
	const updateStore = useUpdateStore(Number(storeId));
	const mutation = isEdit ? updateStore : createStore;

	function handleSubmit(e: FormEvent) {
		e.preventDefault();
		if (customer === "") return;
		if (isEdit) {
			updateStore.mutate(
				{ customer, nameStore, storeAddress, isActive },
				{ onSuccess: () => navigate("/panel/stores") },
			);
		} else {
			const payload: StorePayload = { idStore: Number(idStore), customer, nameStore, storeAddress, isActive };
			createStore.mutate(payload, { onSuccess: () => navigate("/panel/stores") });
		}
	}

	return (
		<div className="p-6 max-w-lg mx-auto space-y-4">
			<form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-6">
				<div className="flex items-center justify-between">
					<h1 className="text-xl font-bold text-white">{isEdit ? "Магазин" : "Новий магазин"}</h1>
					{isEdit && !isEditingDetails && (
						<Button type="button" variant="ghost" onClick={() => setIsEditingDetails(true)}>
							✏️ Редагувати
						</Button>
					)}
				</div>

				<Input
					label="ID магазину (1С)"
					type="number"
					value={idStore}
					onChange={(e) => setIdStore(e.target.value)}
					required
					disabled={isEdit}
					helpText={isEdit ? "ID не можна змінити після створення" : undefined}
				/>

				<div className="flex flex-col gap-1">
					<label className="text-sm font-medium text-white/70">Клієнт</label>
					<select
						value={customer}
						onChange={(e) => setCustomer(e.target.value ? Number(e.target.value) : "")}
						disabled={detailsLocked}
						required
						className="w-full rounded-lg border border-white/10 bg-white/5 text-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 [&>option]:bg-slate-900 [&>option]:text-white"
					>
						<option value="">— оберіть клієнта —</option>
						{customers?.map((c) => (
							<option key={c.idCustomer} value={c.idCustomer}>{c.nameCustomer}</option>
						))}
					</select>
				</div>

				<Input label="Назва магазину" value={nameStore} onChange={(e) => setNameStore(e.target.value)} required disabled={detailsLocked} />
				<Input label="Адреса" value={storeAddress} onChange={(e) => setStoreAddress(e.target.value)} disabled={detailsLocked} />

				<label className="flex items-center gap-2 text-sm text-white/70">
					<input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} disabled={detailsLocked} />
					Магазин активний
				</label>

				{mutation.isError && <ErrorBanner message={(mutation.error as Error).message} />}

				<div className="flex gap-3">
					<Button type="button" variant="ghost" onClick={() => navigate("/panel/stores")}>
						{detailsLocked ? "← Назад" : "Скасувати"}
					</Button>
					<Button type="submit" isLoading={mutation.isPending} className="flex-1">Зберегти</Button>
				</div>
			</form>
		</div>
	);
}
