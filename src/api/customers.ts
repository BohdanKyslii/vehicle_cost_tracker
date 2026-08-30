import type { Customer, Store, StoreDeliveryAddress } from "../types";
import { apiFetch } from "./config.ts";

interface Paginated<T> {
	results: T[];
}

interface RawCustomer {
	id_customer: number;
	name_customer: string;
	network_customer: string;
	is_active: boolean;
	stores_count: number;
	created_at: string;
	updated_at: string;
}

function mapCustomer(raw: RawCustomer): Customer {
	return {
		idCustomer: raw.id_customer,
		nameCustomer: raw.name_customer,
		networkCustomer: raw.network_customer || undefined,
		isActive: raw.is_active,
		storesCount: raw.stores_count,
		createdAt: raw.created_at,
		updatedAt: raw.updated_at,
	};
}

export async function fetchCustomers(search = ""): Promise<Customer[]> {
	const query = search ? `?search=${encodeURIComponent(search)}` : "";
	const data = await apiFetch<Paginated<RawCustomer>>(`/customers/${query}`);
	return data.results.map(mapCustomer);
}

export async function fetchCustomer(id: number): Promise<Customer> {
	const raw = await apiFetch<RawCustomer>(`/customers/${id}/`);
	return mapCustomer(raw);
}

export interface CustomerPayload {
	idCustomer: number;
	nameCustomer: string;
	networkCustomer?: string;
	isActive: boolean;
}

function toCustomerPayload(data: CustomerPayload) {
	return {
		id_customer: data.idCustomer,
		name_customer: data.nameCustomer,
		network_customer: data.networkCustomer ?? "",
		is_active: data.isActive,
	};
}

export async function createCustomer(data: CustomerPayload): Promise<Customer> {
	const raw = await apiFetch<RawCustomer>("/customers/", { method: "POST", json: toCustomerPayload(data) });
	return mapCustomer(raw);
}

// id_customer — первинний ключ (1С id), той самий принцип, що products.ts:
// НЕ надсилається повторно при PATCH
export async function updateCustomer(id: number, data: Omit<CustomerPayload, "idCustomer">): Promise<Customer> {
	const { id_customer, ...rest } = toCustomerPayload({ ...data, idCustomer: id });
	void id_customer;
	const raw = await apiFetch<RawCustomer>(`/customers/${id}/`, { method: "PATCH", json: rest });
	return mapCustomer(raw);
}

interface RawStoreDeliveryAddress {
	id: number;
	store: number;
	delivery_address: string;
	is_primary: boolean;
	notes: string;
	created_at: string;
}

function mapStoreDeliveryAddress(raw: RawStoreDeliveryAddress): StoreDeliveryAddress {
	return {
		id: raw.id,
		store: raw.store,
		deliveryAddress: raw.delivery_address,
		isPrimary: raw.is_primary,
		notes: raw.notes || undefined,
		createdAt: raw.created_at,
	};
}

interface RawStore {
	id_store: number;
	customer: number;
	customer_name: string;
	name_store: string;
	store_address: string;
	is_active: boolean;
	updated_at: string;
	delivery_addresses: RawStoreDeliveryAddress[];
}

function mapStore(raw: RawStore): Store {
	return {
		idStore: raw.id_store,
		customer: raw.customer,
		customerName: raw.customer_name || undefined,
		nameStore: raw.name_store,
		storeAddress: raw.store_address || undefined,
		isActive: raw.is_active,
		updatedAt: raw.updated_at,
		deliveryAddresses: raw.delivery_addresses.map(mapStoreDeliveryAddress),
	};
}

export async function fetchStores(search = ""): Promise<Store[]> {
	const query = search ? `?search=${encodeURIComponent(search)}` : "";
	const data = await apiFetch<Paginated<RawStore>>(`/stores/${query}`);
	return data.results.map(mapStore);
}

export async function fetchStore(id: number): Promise<Store> {
	const raw = await apiFetch<RawStore>(`/stores/${id}/`);
	return mapStore(raw);
}

export interface StorePayload {
	idStore: number;
	customer: number;
	nameStore: string;
	storeAddress?: string;
	isActive: boolean;
}

function toStorePayload(data: StorePayload) {
	return {
		id_store: data.idStore,
		customer: data.customer,
		name_store: data.nameStore,
		store_address: data.storeAddress ?? "",
		is_active: data.isActive,
	};
}

export async function createStore(data: StorePayload): Promise<Store> {
	const raw = await apiFetch<RawStore>("/stores/", { method: "POST", json: toStorePayload(data) });
	return mapStore(raw);
}

export async function updateStore(id: number, data: Omit<StorePayload, "idStore">): Promise<Store> {
	const { id_store, ...rest } = toStorePayload({ ...data, idStore: id });
	void id_store;
	const raw = await apiFetch<RawStore>(`/stores/${id}/`, { method: "PATCH", json: rest });
	return mapStore(raw);
}
