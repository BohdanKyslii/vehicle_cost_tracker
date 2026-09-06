import { Link } from "react-router-dom";
import { useCarrierShipments } from "../../hocks/useCarrierShipments";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { formatCarrier } from "../../utils/formatters";

export function CarrierShipmentList() {
	const { data: shipments, isLoading, isError, refetch } = useCarrierShipments();

	return (
		<div className="p-6 space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold text-white">Служби доставки</h1>
				<Link to="/carriers/new" className="px-3 py-2 text-sm rounded-lg bg-violet-600 text-white hover:bg-violet-500">
					+ Нове відправлення
				</Link>
			</div>

			{isLoading && <Spinner size="lg" label="Завантаження..." />}
			{isError && !isLoading && <ErrorBanner message="Не вдалось завантажити відправлення" onRetry={refetch} />}
			{!isLoading && !isError && shipments?.length === 0 && (
				<EmptyState title="Відправлень ще немає" subtitle="Натисніть «Нове відправлення», щоб внести перше" />
			)}

			{!isLoading && !isError && shipments && shipments.length > 0 && (
				<table className="w-full text-sm">
					<thead className="text-left text-white/50 border-b border-white/10">
						<tr>
							<th className="py-2">Дата</th>
							<th className="py-2">Служба</th>
							<th className="py-2">ТТН</th>
							<th className="py-2">Накладних</th>
						</tr>
					</thead>
					<tbody>
						{shipments.map((s) => (
							<tr key={s.id} className="border-b border-white/5 hover:bg-white/5">
								<td className="py-2">{s.shipmentDate}</td>
								<td className="py-2">{formatCarrier(s.carrier)}</td>
								<td className="py-2">
									<Link to={`/carriers/${s.id}`} className="text-violet-300 hover:underline">{s.ttn}</Link>
								</td>
								<td className="py-2">{s.waybills?.length ?? 0}</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	);
}
