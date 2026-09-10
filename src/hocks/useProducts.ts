import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	fetchProductCategories,
	fetchProductCategory,
	fetchProducts,
	fetchProduct,
	createProduct,
	updateProduct,
	createProductCategory,
	updateProductCategory,
	deleteProductCategory,
} from "../api/products";
import type { ProductPayload, ProductCategoryPayload } from "../api/products";

export function useProductCategories() {
	return useQuery({ queryKey: ["product-categories"], queryFn: fetchProductCategories });
}

export function useProductCategory(id: number) {
	return useQuery({
		queryKey: ["product-categories", "detail", id],
		queryFn: () => fetchProductCategory(id),
		enabled: !!id,
	});
}

export function useCreateProductCategory() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: ProductCategoryPayload) => createProductCategory(data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["product-categories"] }),
	});
}

export function useUpdateProductCategory(id: number) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: ProductCategoryPayload) => updateProductCategory(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["product-categories"] });
			queryClient.invalidateQueries({ queryKey: ["product-categories", "detail", id] });
		},
	});
}

export function useDeleteProductCategory() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => deleteProductCategory(id),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["product-categories"] }),
	});
}

export function useProducts(search = "") {
	return useQuery({ queryKey: ["products", search], queryFn: () => fetchProducts(search) });
}

export function useProduct(id: number) {
	return useQuery({
		queryKey: ["products", "detail", id],
		queryFn: () => fetchProduct(id),
		enabled: !!id,
	});
}

export function useCreateProduct() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: ProductPayload) => createProduct(data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
	});
}

export function useUpdateProduct(id: number) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Omit<ProductPayload, "idProduct">) => updateProduct(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["products"] });
			queryClient.invalidateQueries({ queryKey: ["products", "detail", id] });
		},
	});
}

// Та сама логіка, що useUpdateProduct, але id передається в mutate(), а не
// фіксується при виклику хука — потрібно для інлайн-редагування статусу
// прямо в рядку таблиці ProductList (id хука не можна викликати в циклі)
export function useUpdateProductById() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: Omit<ProductPayload, "idProduct"> }) => updateProduct(id, data),
		onSuccess: (_result, { id }) => {
			queryClient.invalidateQueries({ queryKey: ["products"] });
			queryClient.invalidateQueries({ queryKey: ["products", "detail", id] });
		},
	});
}
