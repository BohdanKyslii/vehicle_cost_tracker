import type { Product, ProductCategory, ProductLogistics } from "../types";
import { apiFetch } from "./config.ts";

interface Paginated<T> {
	results: T[];
}

interface RawProductCategory {
	id: number;
	name_category: string;
	parent: number | null;
	is_root: boolean;
	parent_name: string | null;
}

function mapProductCategory(raw: RawProductCategory): ProductCategory {
	return {
		id: raw.id,
		nameCategory: raw.name_category,
		parent: raw.parent,
		isRoot: raw.is_root,
		parentName: raw.parent_name,
	};
}

export async function fetchProductCategories(): Promise<ProductCategory[]> {
	const data = await apiFetch<Paginated<RawProductCategory>>("/product-categories/");
	return data.results.map(mapProductCategory);
}

export interface ProductCategoryPayload {
	nameCategory: string;
	parent: number | null;
}

function toProductCategoryPayload(data: ProductCategoryPayload) {
	return { name_category: data.nameCategory, parent: data.parent };
}

export async function createProductCategory(data: ProductCategoryPayload): Promise<ProductCategory> {
	const raw = await apiFetch<RawProductCategory>("/product-categories/", { method: "POST", json: toProductCategoryPayload(data) });
	return mapProductCategory(raw);
}

// DRF серіалізує DecimalField як рядок у JSON — той самий гачок, що в cars.ts
interface RawProductLogistics {
	unit_weight_kg?: string | null;
	unit_length_cm?: string | null;
	unit_width_cm?: string | null;
	unit_height_cm?: string | null;
	units_per_box?: number | null;
	box_weight_kg?: string | null;
	box_length_cm?: string | null;
	box_width_cm?: string | null;
	box_height_cm?: string | null;
	unit_volume_cbm?: number | null;
	box_volume_cbm?: number | null;
	calculated_box_weight?: number | null;
}

function mapProductLogistics(raw: RawProductLogistics): ProductLogistics {
	return {
		unitWeightKg: raw.unit_weight_kg ? Number(raw.unit_weight_kg) : undefined,
		unitLengthCm: raw.unit_length_cm ? Number(raw.unit_length_cm) : undefined,
		unitWidthCm: raw.unit_width_cm ? Number(raw.unit_width_cm) : undefined,
		unitHeightCm: raw.unit_height_cm ? Number(raw.unit_height_cm) : undefined,
		unitsPerBox: raw.units_per_box ?? undefined,
		boxWeightKg: raw.box_weight_kg ? Number(raw.box_weight_kg) : undefined,
		boxLengthCm: raw.box_length_cm ? Number(raw.box_length_cm) : undefined,
		boxWidthCm: raw.box_width_cm ? Number(raw.box_width_cm) : undefined,
		boxHeightCm: raw.box_height_cm ? Number(raw.box_height_cm) : undefined,
		unitVolumeCbm: raw.unit_volume_cbm ?? null,
		boxVolumeCbm: raw.box_volume_cbm ?? null,
		calculatedBoxWeight: raw.calculated_box_weight ?? null,
	};
}

interface RawProduct {
	id_product: number;
	name_product: string;
	category: number | null;
	category_name: string | null;
	description: string;
	is_active: boolean;
	logistics: RawProductLogistics | null;
	created_at: string;
	updated_at: string;
}

function mapProduct(raw: RawProduct): Product {
	return {
		idProduct: raw.id_product,
		nameProduct: raw.name_product,
		category: raw.category,
		categoryName: raw.category_name ?? undefined,
		description: raw.description || undefined,
		isActive: raw.is_active,
		logistics: raw.logistics ? mapProductLogistics(raw.logistics) : undefined,
		createdAt: raw.created_at,
		updatedAt: raw.updated_at,
	};
}

export async function fetchProducts(search = ""): Promise<Product[]> {
	const query = search ? `?search=${encodeURIComponent(search)}` : "";
	const data = await apiFetch<Paginated<RawProduct>>(`/products/${query}`);
	return data.results.map(mapProduct);
}

export async function fetchProduct(id: number): Promise<Product> {
	const raw = await apiFetch<RawProduct>(`/products/${id}/`);
	return mapProduct(raw);
}

export interface ProductPayload {
	idProduct: number;
	nameProduct: string;
	category: number | null;
	description?: string;
	isActive: boolean;
	logistics?: {
		unitWeightKg?: number;
		unitLengthCm?: number;
		unitWidthCm?: number;
		unitHeightCm?: number;
		unitsPerBox?: number;
		boxWeightKg?: number;
		boxLengthCm?: number;
		boxWidthCm?: number;
		boxHeightCm?: number;
	};
}

function toProductPayload(data: ProductPayload) {
	return {
		id_product: data.idProduct,
		name_product: data.nameProduct,
		category: data.category,
		description: data.description ?? "",
		is_active: data.isActive,
		...(data.logistics && {
			logistics: {
				unit_weight_kg: data.logistics.unitWeightKg ?? null,
				unit_length_cm: data.logistics.unitLengthCm ?? null,
				unit_width_cm: data.logistics.unitWidthCm ?? null,
				unit_height_cm: data.logistics.unitHeightCm ?? null,
				units_per_box: data.logistics.unitsPerBox ?? null,
				box_weight_kg: data.logistics.boxWeightKg ?? null,
				box_length_cm: data.logistics.boxLengthCm ?? null,
				box_width_cm: data.logistics.boxWidthCm ?? null,
				box_height_cm: data.logistics.boxHeightCm ?? null,
			},
		}),
	};
}

export async function createProduct(data: ProductPayload): Promise<Product> {
	const raw = await apiFetch<RawProduct>("/products/", { method: "POST", json: toProductPayload(data) });
	return mapProduct(raw);
}

// id_product — первинний ключ, навмисно НЕ надсилається повторно в PATCH
// (зміна PK-поля існуючого запису на бекенді ризикована — Django save()
// із зміненим instance.pk намагається INSERT замість UPDATE)
export async function updateProduct(id: number, data: Omit<ProductPayload, "idProduct">): Promise<Product> {
	const { id_product, ...rest } = toProductPayload({ ...data, idProduct: id });
	void id_product;
	const raw = await apiFetch<RawProduct>(`/products/${id}/`, { method: "PATCH", json: rest });
	return mapProduct(raw);
}
