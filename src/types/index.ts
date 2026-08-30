// ─────────────────────────────────────────────────────────
// REFERENCE MATERIALS
// ─────────────────────────────────────────────────────────


// Product category — ProductCategorySerializer (бекенд) НЕ віддає
// description/created_at/updated_at, хоч модель їх і має — лише поля нижче
export interface ProductCategory {
	id: number;
	nameCategory: string;
	parent: number | null;
	isRoot: boolean;
	parentName: string | null;
}

// Constant IDs for convenience in the code
export const CATEGORY_DEFAULTS = {
	ROOT_OTHER: 3,
	CHILD_OTHER: 15,
}

// Product from the 1C accounting system
export interface Product {
	idProduct: number;    // PK — артикул 1С, вводиться вручну (не auto-id)
	nameProduct: string;
	category: number | null; // FK id категорії; default: 15 ("Інше" → "Супутка")
	categoryName?: string;
	description?: string;
	isActive: boolean;  // default: true
	logistics?: ProductLogistics;
	createdAt: string;
	updatedAt: string;
}

// Default values — use when creating a new product in the form
export const PRODUCT_DEFAULTS: Partial<Product> = {
	category: CATEGORY_DEFAULTS.CHILD_OTHER, // 15
	isActive: true,
};

// Product logistics data — окрема таблиця в БД, ProductLogisticsSerializer
// не віддає id/product (лише поля товару + обчислювані *_cbm/calculated_*)
export interface ProductLogistics {
	unitWeightKg?: number;
	unitLengthCm?: number;
	unitWidthCm?: number;
	unitHeightCm?: number;
	unitsPerBox?: number;
	boxWeightKg?: number;
	boxLengthCm?: number;
	boxWidthCm?: number;
	boxHeightCm?: number;
	unitVolumeCbm?: number | null;
	boxVolumeCbm?: number | null;
	calculatedBoxWeight?: number | null;
}

// Client (purchasing company) to whom the goods are shipped
export interface Customer {
	idCustomer: number;
	nameCustomer: string;
	networkCustomer?: string;
	isActive: boolean;
	storesCount?: number;
	createdAt: string;
	updatedAt: string;
}

// Client's store / retail outlet where goods are delivered
export interface Store {
	idStore: number;
	customer: number;    // FK id клієнта
	customerName?: string;
	nameStore: string;
	storeAddress?: string;
	isActive: boolean;
	updatedAt: string;
	deliveryAddresses?: StoreDeliveryAddress[];
}

// Additional store delivery address
// A single store can have multiple addresses
export interface StoreDeliveryAddress {
	id: number;
	store: number;
	deliveryAddress: string;
	isPrimary: boolean; // main address delivery address
	notes?: string;
	createdAt: string;
}

// ─────────────────────────────────────────────────────────
// VEHICLE FLEET
// ─────────────────────────────────────────────────────────

// Driver vehicle tracking mode
// daily = morning odometer reading only
// full = tracking of every unloading point
export type TrackingMode = 'daily' | 'full';

// Two moments of the same `delivery` event in `full` mode:
// "load" = scanning at the warehouse before departure (no odometer, car hasn't moved)
// "unload" = arriving at a physical stop (odometer + pallets required)
// Not stored on RouteEvent itself (no backend column) — carried only in the
// EventForm URL (?stage=) and inferred for already-saved events from odometerKm.
export type DeliveryStage = 'load' | 'unload';

// Car operational status: active, under repair, or decommissioned
// pause — вимушений простій через регуляцію часу праці водія/авто (тахограф);
// driver_downtime — простій через відсутність водія (лікарняний, відпустка,
// сімейні обставини тощо), без деталізації причини на рівні статусу
export type CarStatus = "active" | "repair" | "inactive" | "pause" | "driver_downtime";

// Vehicle status
export interface Car {
	idCar: number;
	nameCar: string;    // Mercedes Sprinter 315 CDI
	numberCar: string;  // license plate "АА1234ВВ"
	fuelCardNumber?: number;    // fuel card number assigned to the vehicle
	amountCar: number;  // depreciation UAH/month — fixed
	defaultTrackingMode?: TrackingMode;
	statusCar: CarStatus;
	isActive: boolean;
	// Nested objects
	specs?: CarSpecs;
	trailer?: Trailer;
}

// Car technical specifications
export interface CarSpecs {
	idCar: number;
	vinCode?: string;   // VIN code
	yearManufactured?: number;  // year of manufacture
	weightKg?: number;  // weight of the vehicle (kg)
	payloadKg?: number; // payload capacity (kg)
	lengthCm?: number;  // dimensions (cm)
	widthCm?: number;
	heightCm?: number;
	hasTailLift: boolean;   // hydraulic lift default: false
	hasTrailer: boolean;    // default: false
	trailer?: Trailer;  // filled in only if hasTrailer = true
}

// semi-trailer to car
export interface Trailer {
	idTrailer: number;
	vinCode?: string;   // VIN code
	yearManufactured?: number;  // year of manufacture
	nameTrailer: string;    // Schmitz semi-trailer
	idCar: number;  // to which car it is attached
	numberTrailer: string;  // license plate "АА1234ВВ"
	isActive: boolean;
}

// Car status change history log
export interface CarStatusLog {
	id: number;
	idCar: number;
	status: CarStatus;
	reason?: string;          // Comment: reason for status change
	changedAt: string;        // Comment: when the status was changed
	changedBy?: number;       // Comment: id of the user who changed the status
}

// Driver
export interface Driver {
	idDriver: number;
	nameDriver: string;
	phoneDriver?: string;
	driversLicense?: string;  // Driver's license number
	idCar: number | null;   // vehicle to which it is assigned
	isActive: boolean;
	car?: Car;
}

// ─────────────────────────────────────────────────────────
// DELIVERY CHANNEL
// ─────────────────────────────────────────────────────────

// Company's legal entity
export type LegalEntity = 'ESP' | 'OPT' | 'Rubin';

// Delivery channel — each waybill belongs to ONLY one channel
// own     = company vehicle (driver scans QR code)
// hired   = hired transport (logistics coordinator enters data)
// carrier = delivery service (Nova Poshta, Meest Express)
export type DeliveryChannel = 'own' | 'hired' | 'carrier';

// ─────────────────────────────────────────────────────────
// INVOICE REGISTRY (from 1C)
// ─────────────────────────────────────────────────────────

// A single invoice line from 1C
// quantity > 0 = shipment
// quantity < 0 = return
export interface WaybillRecord {
	id: number;
	legalEntity: LegalEntity;
	waybillNumber: string;   // 1C invoice number
	waybillDate: string;     // 1C invoice date
	linePosition: number;   // line item position in the invoice
	customerId: string;
	customerName: string;
	storeId?: string;
	productId: number;
	productName: string;
	quantity: number;
	priceUah: number;
	totalUah: number;
	comment?: string;
	// Logistics (from the reference data; calculated upon import)
	totalWeightKg?: number;
	totalVolumeCbm?: number;
	volumetricWeightKg?: number;
	// Channel: null = not yet assigned
	deliveryChannel?: DeliveryChannel | null;
	status?: WaybillStatus;
	importedAt: string;
	importBatchId?: string;
}

// Aggregated waybill (all lines of a single waybill → one row in the UI table)
export interface WaybillSummary {
	legalEntity: LegalEntity;
	waybillNumber: string;
	waybillDate: string;
	customerId: string;
	customerName: string;
	storeId?: string;
	storeName?: string;
	linesCount: number;
	totalUah: number;       // total value of shipments
	returnsUah: number;     // sum of returns (negative)
	totalWeightKg?: number;
	totalVolumeCbm?: number;
	deliveryChannel?: DeliveryChannel | null;
	// Channel details
	carId?: number;
	carNumber?: string;
	tripId?: number;
	tripRouteName?: string;
	shipmentId?: number;
	carrierName?: string;
	status: WaybillStatus;
}

export type WaybillStatus = "pending" | "scanned" | "delivered" | "cancelled";

// ─────────────────────────────────────────────────────────
// ROUTE TRACKING (company-owned fleet)
// ─────────────────────────────────────────────────────────

export type RouteEventType =
	| 'depot_start' // Start of morning to warehouse
	| 'delivery' // Delivery to the store
	| 'parking_end' // End of the workday: parking the car
	| 'depot_return' // Return to warehouse (full mode)
	| 'refuel'  // car refueling
	| 'other_cost' // other driver expenses on the route
	| 'return_goods'    // return of goods to the warehouse
	| 'extra_cargo' // additional cargo (not in the waybill)

// Refusal to accept the goods
export interface DeliveryRejection {
	isFull: boolean;
	productId?: number;
	quantity?: number;
	comment?: string;
}

// A single route event
export interface RouteEvent {
	id: number;
	carId: number;
	driverId: number;
	trackingMode?: TrackingMode;
	eventType: RouteEventType;
	eventTs: string;
	odometerKm?: number;
	palletsCount?: number;  // number of pallets (depot_start daily / delivery full)

	// For delivery
	waybillNumber?: string;
	waybillDate?: string;
	customerName?: string;
	rejection?: DeliveryRejection;
	
	// For refuel
	fuelLiters?: number;
	fuelCostUah?: number;
	adBlueLiters?: number;
	adBlueCostUah?: number;
	
	// For other_cost
	otherCostUah?: number;
	otherCostComment?: string;
	
	// For return_goods
	returnClientWaybill?: string;
	
	// For extra_cargo
	extraFrom?: string;
	extraTo?: string;
	extraWeightKg?: number;
	extraWaybill?: string
	extraComment?: string;
	
	notes?: string;
	createdAt: string;
}

// Type for creating an event (excluding id and createdAt — these are generated by the server)
// Omit<T, K> is a TypeScript utility that removes fields K from type T
export type RouteEventCreate = Omit<RouteEvent, 'id' | 'createdAt'>;

// Route segment between two events (full mode only)
export interface RouteSegment {
	fromEvent: RouteEventType;
	toEvent: RouteEventType;
	waybillNumber?: string;
	customerName?: string;
	distanceKm: number;
	durationMin: number;
}

// Day summary — calculated from the RouteEvent array
export interface DailySummary {
	carId: number;
	driverId: number;
	trackingMode: TrackingMode;
	date: string;
	totalMileageKm: number;
	loadedMileageKm: number | null; // null for daily mode
	emptyMileageKm: number | null; // null for daily mode
	palletsCount: number | null;
	fuelLiters: number;
	fuelCostUah: number;
	adBlueLiters: number;
	adBlueCostUah: number;
	otherCostUah: number;
	deliveriesCount: number;
	returnCount: number;
	extraCargoCount: number;
	waybillNumbers: string[];
	segments: RouteSegment[]; // null for daily mode
}

// ─────────────────────────────────────────────────────────
// MONTHLY EXPENSES (from the logistician)
// ─────────────────────────────────────────────────────────

export interface MonthlyCosts {
	id: number;
	carId: number;
	month: string; // format YYYY-MM
	salaryUah: number;
	taxesUah: number;
	depreciationUah: number;
	repairActualUah?: number;   // if present — takes precedence over the calculated value
	repairRateUahKm: number;    // default: 2.00 uah/km
	otherCostUah: number;
	otherCostComment?: string;
}

export type MonthlyCostsForm = Omit<MonthlyCosts, "id">;

// With calculated fields
export interface MonthlyCostsSummary extends MonthlyCosts {
	totalKm: number;
	repairCostUah: number;    // actual or rate × km
	totalCostUah: number;
}

// ─────────────────────────────────────────────────────────
// HIRED TRANSPORT
// ─────────────────────────────────────────────────────────

export interface HiredTransportTrip {
	id: number;
	carNumber: string;      // free-text input, not from a reference list
	routeName: string;      // Route: "Pyriatyn, Poltava, Kharkiv"
	tripDate: string;
	palletsCount?: number;
	costUah: number;        // actual cost of the trip (UAH)
	comment?: string;
	createdAt: string;
	waybills?: HiredTripWaybill[];
}

export type HiredTransportTripCreate = Omit<
	HiredTransportTrip,
	"id" | "createdAt" | "waybills"
>;

export interface HiredTripWaybill {
	id: number;
	tripId: number;
	waybillNumber: string;
}

// ─────────────────────────────────────────────────────────
// Delivery services (Nova Poshta, Meest Express)
// ─────────────────────────────────────────────────────────

export interface CarrierShipment {
	id: number;
	carrierName: string;    // Nova Poshta / Meest Express
	ttn: string;            // Waybill number with the carrier
	shipmentDate: string;
	comment?: string;
	createdAt: string;
	waybills?: CarrierWaybill[];
	cost?: CarrierCost;
}

export type CarrierShipmentCreate = Omit<
	CarrierShipment,
	"id" | "createdAt" | "waybills" | "cost"
>;

export interface CarrierWaybill {
	id: number;
	shipmentId: number;
	waybillNumber: string;
	scannedAt: string;
}

export interface CarrierCost {
	id: number;
	shipmentId?: number;
	carrierName: string;
	ttn: string;
	costDate: string;
	weightKg?: number;
	costUah: number;
	importBatchId?: string;
	importedAt: string;
}

// ─────────────────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────────────────

export interface TransportCostPerWaybill {
	legalEntity: LegalEntity;
	waybillNumber: string;
	waybillDate: string;
	customerId: string;
	customerName: string;
	storeId?: string;
	carId: number;
	carNumber: string;
	saleUah: number;
	totalWeightKg?: number;
	totalVolumeCbm?: number;
	allocatedCostUah: number;   // allocated costs for the vehicle
	costPctOfSale: number;      // % of the sale amount
}

export interface TransportCostPerCustomer {
	customerId: string;
	customerName: string;
	networkCustomer?: string;
	waybillsCount: number;
	saleUah: number;
	totalWeightKg?: number;
	// Breakdown by channel
	ownCostUah: number;
	hiredCostUah: number;
	carrierCostUah: number;
	totalCostUah: number;
	costPctOfSale: number;
}

export interface CarMonthlySummary {
	carId: number;
	carNumber: string;
	month: string;
	totalKm: number;
	totalPallets: number;
	fuelLiters: number;
	fuelCostUah: number;
	adBlueLiters: number;
	adBlueCostUah: number;
	fuelLitersPer100Km: number;
	totalCostUah: number;
	costPerKmUah: number;
}

export interface ChannelComparison {
	month: string;
	ownWaybillsCount: number;
	ownTotalCostUah: number;
	ownCostPerPallet: number;
	hiredWaybillsCount: number;
	hiredTotalCostUah: number;
	hiredCostPerPallet: number;
	carrierWaybillsCount: number;
	carrierTotalCostUah: number;
}

// ─────────────────────────────────────────────────────────
// UI Auxiliary Types
// ─────────────────────────────────────────────────────────

export type LoadingState = "idle" | "loading" | "success" | "error";

export interface PaginationParams {
	page: number;
	pageSize: number;
}

// Generic — T can be any type
// PaginatedResponse<Car>, PaginatedResponse<WaybillSummary>, etc.
export interface PaginatedResponse<T> {
	items: T[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

export interface WaybillFilters {
	search?: string;
	status?: WaybillStatus;
	deliveryChannel?: DeliveryChannel | "unassigned" | "all";
	carId?: number;
	legalEntity?: LegalEntity;
	lineType?: "shipment" | "return" | "all";
	storeId?: string;
	dateFrom?: string;
	dateTo?: string;
}

export type SortField = "date" | "total" | "customer" | "vehicle" | "weight";
export type SortDirection = "asc" | "desc";

export interface SortParams {
	field: SortField;
	direction: SortDirection;
}

export interface ImportResult {
	batchId: string;
	imported: number;
	skipped: number;
	errors: ImportError[];
}

export interface ImportError {
	row: number;
	field: string;
	message: string;
}

// Scanned waybill (driver/logistics provider format)
export interface ScannedWaybill {
	waybillNumber: string;
	waybillDate: string;
	scannedAt: string;
	customerName?: string;
	storeName?: string;
	deliveryChannel?: DeliveryChannel;  // to verify exclusivity
}

// ─────────────────────────────────────────────────────────
// ADMIN — КЕРУВАННЯ КОРИСТУВАЧАМИ (/panel/users, head-only)
// ─────────────────────────────────────────────────────────

// Той самий набір ролей, що UserProfile["role"] (src/api/auth.ts) — не
// імпортуємо звідти напряму (types/index.ts свідомо не залежить від api/),
// дублювання тут те саме джерело правди, що CarStatus/TrackingMode вище.
export type UserRole = "driver" | "logist" | "manager" | "head";

// Користувач у панелі керування — і активні акаунти, і pending-заявки
// (isActive: false). Заявки, зареєстровані через Telegram-бот, мають
// username "tg_<telegram_id>" і вже заповнений telegramId.
export interface AdminUser {
	id: number;
	username: string;
	email: string;
	isActive: boolean;
	dateJoined: string;
	role: UserRole;
	phone?: string;
	telegramId?: number | null;
	driverId?: number | null;
	driverName?: string | null;
}
