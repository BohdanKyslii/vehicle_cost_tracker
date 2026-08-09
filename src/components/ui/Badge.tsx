import type { WaybillStatus, DeliveryChannel, LegalEntity, CarStatus } from "../../types";

// Статус накладної
const statusConfig: Record<WaybillStatus, { label: string; class: string }> = {
    pending:   { label: "Очікує",      class: "bg-yellow-100 text-yellow-800" },
    scanned:   { label: "Відскановано", class: "bg-blue-100 text-blue-800"   },
    delivered: { label: "Доставлено",  class: "bg-green-100 text-green-800"  },
    cancelled: { label: "Скасовано",   class: "bg-gray-100 text-gray-600"    },
};

export function StatusBadge({ status }: { status: WaybillStatus }) {
    const { label, class: cls } = statusConfig[status];
    return (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
    );
}

// Канал доставки
const channelConfig: Record<DeliveryChannel | "unassigned", { label: string; class: string }> = {
    own:       { label: "Власне авто",        class: "bg-slate-100 text-slate-700"   },
    hired:     { label: "Найманий транспорт", class: "bg-amber-100 text-amber-800"   },
    carrier:   { label: "Служба доставки",   class: "bg-purple-100 text-purple-800" },
    unassigned:{ label: "⚠️ Не призначено",   class: "bg-orange-100 text-orange-800" },
};

export function ChannelBadge({ channel }: { channel: DeliveryChannel | null | undefined }) {
    const key = channel ?? "unassigned";
    const { label, class: cls } = channelConfig[key as keyof typeof channelConfig];
    return (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
    );
}

// Юридична особа
const legalConfig: Record<LegalEntity, string> = {
    ESP:   "bg-blue-100 text-blue-800",
    OPT:   "bg-green-100 text-green-800",
    Rubin: "bg-red-100 text-red-800",
};

export function LegalEntityBadge({ entity }: { entity: LegalEntity }) {
    return (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${legalConfig[entity]}`}>
      {entity}
    </span>
    );
}

// Статус авто
const carStatusConfig: Record<CarStatus, { label: string; class: string }> = {
    active:   { label: "Активне",   class: "bg-green-100 text-green-800"  },
    repair:   { label: "Ремонт",    class: "bg-yellow-100 text-yellow-800" },
    inactive: { label: "Неактивне", class: "bg-gray-100 text-gray-600"    },
};

export function CarStatusBadge({ status }: { status: CarStatus }) {
    const { label, class: cls } = carStatusConfig[status];
    return (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
    );
}
