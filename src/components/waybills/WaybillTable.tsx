import { Link } from "react-router-dom";
import type { WaybillSummary, SortParams, SortField } from "../../types";
import { SortHeader } from "../ui/SortHeader";
import { StatusBadge, ChannelBadge, LegalEntityBadge } from "../ui/Badge";
import { formatDate, formatUah, formatKg } from "../../utils/formatters";

interface WaybillTableProps {
	items: WaybillSummary[];
	sort: SortParams;
	onSort: (field: SortField) => void;
}

export function WaybillTable({ items, sort, onSort }: WaybillTableProps) {
	return (
		<div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
			<table className="w-full text-sm">
				<thead className="bg-gray-50 border-b border-gray-200">
				<tr>
					<SortHeader label="Дата" field="date" currentField={sort.field} direction={sort.direction} onSort={onSort} />
					<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Накладна</th>
					<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ЮО</th>
					<SortHeader label="Клієнт" field="customer" currentField={sort.field} direction={sort.direction} onSort={onSort} />
					<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Канал</th>
					<SortHeader label="Сума" field="total" currentField={sort.field} direction={sort.direction} onSort={onSort} />
					<SortHeader label="Вага" field="weight" currentField={sort.field} direction={sort.direction} onSort={onSort} />
					<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
				</tr>
				</thead>
				<tbody className="divide-y divide-gray-100">
				{items.map(item => (
					<tr key={item.waybillNumber} className="hover:bg-gray-50 transition-colors">
						<td className="px-4 py-3 text-gray-600 whitespace-nowrap">
							{formatDate(item.waybillDate)}
						</td>
						<td className="px-4 py-3">
							{/* Link — навігація без перезавантаження сторінки */}
							<Link
								to={`/waybills/${item.waybillNumber}`}
								className="text-blue-600 hover:underline font-medium"
							>
								{item.waybillNumber}
							</Link>
							<div className="text-xs text-gray-400">{item.linesCount} поз.</div>
						</td>
						<td className="px-4 py-3">
							<LegalEntityBadge entity={item.legalEntity} />
						</td>
						<td className="px-4 py-3">
							<div className="font-medium text-gray-800">{item.customerName}</div>
							{item.storeName && (
								<div className="text-xs text-gray-500">{item.storeName}</div>
							)}
						</td>
						<td className="px-4 py-3">
							<ChannelBadge channel={item.deliveryChannel} />
						</td>
						<td className="px-4 py-3 text-gray-800 font-medium whitespace-nowrap">
							{formatUah(item.totalUah)}
							{item.returnsUah < 0 && (
								<div className="text-xs text-red-500">{formatUah(item.returnsUah)}</div>
							)}
						</td>
						<td className="px-4 py-3 text-gray-600 whitespace-nowrap">
							{item.totalWeightKg ? formatKg(item.totalWeightKg) : "—"}
						</td>
						<td className="px-4 py-3">
							<StatusBadge status={item.status} />
						</td>
					</tr>
				))}
				</tbody>
			</table>
		</div>
	);
}
