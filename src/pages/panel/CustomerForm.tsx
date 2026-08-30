import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useCustomer, useCreateCustomer, useUpdateCustomer } from "../../hocks/useCustomers";
import { useStores } from "../../hocks/useCustomers";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import type { CustomerPayload } from "../../api/customers";

export function CustomerForm() {
	const { customerId } = useParams();
	const navigate = useNavigate();
	const isEdit = !!customerId;
	const { data: existing } = useCustomer(isEdit ? Number(customerId) : 0);
	const { data: allStores } = useStores();
	const stores = allStores?.filter((s) => existing && s.customer === existing.idCustomer);

	const [idCustomer, setIdCustomer] = useState(String(existing?.idCustomer ?? ""));
	const [nameCustomer, setNameCustomer] = useState(existing?.nameCustomer ?? "");
	const [networkCustomer, setNetworkCustomer] = useState(existing?.networkCustomer ?? "");
	const [isActive, setIsActive] = useState(existing?.isActive ?? true);

	const [isEditingDetails, setIsEditingDetails] = useState(false);
	const detailsLocked = isEdit && !isEditingDetails;

	const createCustomer = useCreateCustomer();
	const updateCustomer = useUpdateCustomer(Number(customerId));
	const mutation = isEdit ? updateCustomer : createCustomer;

	function handleSubmit(e: FormEvent) {
		e.preventDefault();
		if (isEdit) {
			updateCustomer.mutate(
				{ nameCustomer, networkCustomer, isActive },
				{ onSuccess: () => navigate("/panel/customers") },
			);
		} else {
			const payload: CustomerPayload = { idCustomer: Number(idCustomer), nameCustomer, networkCustomer, isActive };
			createCustomer.mutate(payload, { onSuccess: () => navigate("/panel/customers") });
		}
	}

	return (
		<div className="p-6 max-w-lg mx-auto space-y-4">
			<form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-6">
				<div className="flex items-center justify-between">
					<h1 className="text-xl font-bold text-white">{isEdit ? "Клієнт" : "Новий клієнт"}</h1>
					{isEdit && !isEditingDetails && (
						<Button type="button" variant="ghost" onClick={() => setIsEditingDetails(true)}>
							✏️ Редагувати
						</Button>
					)}
				</div>

				<Input
					label="ID клієнта (1С)"
					type="number"
					value={idCustomer}
					onChange={(e) => setIdCustomer(e.target.value)}
					required
					disabled={isEdit}
					helpText={isEdit ? "ID не можна змінити після створення" : undefined}
				/>
				<Input label="Назва" value={nameCustomer} onChange={(e) => setNameCustomer(e.target.value)} required disabled={detailsLocked} />
				<Input label="Напрямок діяльності" value={networkCustomer} onChange={(e) => setNetworkCustomer(e.target.value)} disabled={detailsLocked} placeholder="Роздріб / Мережа / HoReCa" />

				<label className="flex items-center gap-2 text-sm text-white/70">
					<input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} disabled={detailsLocked} />
					Клієнт активний
				</label>

				{mutation.isError && <ErrorBanner message={(mutation.error as Error).message} />}

				<div className="flex gap-3">
					<Button type="button" variant="ghost" onClick={() => navigate("/panel/customers")}>
						{detailsLocked ? "← Назад" : "Скасувати"}
					</Button>
					<Button type="submit" isLoading={mutation.isPending} className="flex-1">Зберегти</Button>
				</div>
			</form>

			{isEdit && (
				<div className="space-y-2 rounded-lg border border-white/10 p-4">
					<div className="flex items-center justify-between">
						<h2 className="text-sm font-semibold text-white">Магазини клієнта</h2>
						<Link to="/panel/stores/new" className="text-xs text-violet-300 hover:underline">+ Магазин</Link>
					</div>
					{stores && stores.length > 0 ? (
						<ul className="space-y-1 text-sm">
							{stores.map((s) => (
								<li key={s.idStore}>
									<Link to={`/panel/stores/${s.idStore}`} className="text-violet-300 hover:underline">{s.nameStore}</Link>
									{s.storeAddress && <span className="text-white/40"> — {s.storeAddress}</span>}
								</li>
							))}
						</ul>
					) : (
						<p className="text-sm text-white/40">Магазинів ще немає</p>
					)}
				</div>
			)}
		</div>
	);
}
