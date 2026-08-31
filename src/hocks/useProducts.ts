import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	fetchProductCategories,
	fetchProducts,
	fetchProduct,
	createProduct,
	updateProduct,
	createProductCategory,
} from "../api/products";
import type { ProductPayload, ProductCategoryPayload } from "../api/products";

export function useProductCategories() {
	return useQuery({ queryKey: ["product-categories"], queryFn: fetchProductCategories });
}

export function useCreateProductCategory() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: ProductCategoryPayload) => createProductCategory(data),
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
