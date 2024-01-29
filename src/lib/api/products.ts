import {
  BaseForm,
  Product,
  ProductImage,
  VariantCombination,
  VariantType,
} from "@/types/Product";
import {
  MakePropertiesRequired,
  PaginatedData,
  QueryParams,
  QueryState,
} from "@/types/data";
import { protectedRequest, publicRequest } from ".";
import { queryStateToQueryString } from "../formater";

export async function getAllProducts<K extends keyof Product>(
  params?: QueryParams<Product>
) {
  const queryParams = params ? "?" + queryStateToQueryString(params) : "";
  const result = await publicRequest<MakePropertiesRequired<Product, K>[]>({
    method: "GET",
    path: "/products/" + queryParams,
  });

  if (!result.success) {
    return null;
  }

  return result.data;
}

export async function getPaginatedProductsRecomend<K extends keyof Product>(
  params?: Omit<QueryState<Product>, "orderBy">
) {
  const queryParams = params ? "?" + queryStateToQueryString(params) : "";
  const result = await publicRequest<
    PaginatedData<MakePropertiesRequired<Product, K>[]>
  >({
    method: "GET",
    path: "/paginated/products/recomendation/" + queryParams,
  });

  if (!result.success) {
    return null;
  }

  return result.data;
}

export async function getStoreProducts<K extends keyof Product>(
  storeSlug: string,
  params?: QueryParams<Product>
) {
  const queryParams = params ? "?" + queryStateToQueryString(params) : "";
  const result = await publicRequest<MakePropertiesRequired<Product, K>[]>({
    method: "GET",
    path: `/stores/${storeSlug}/products/` + queryParams,
  });

  if (!result.success) {
    return null;
  }

  return result.data;
}

export async function getProduct<K extends keyof Product>(
  storeSlug: string,
  productSlug: string,
  params?: QueryParams<Product>
) {
  const queryParams = params ? "?" + queryStateToQueryString(params) : "";
  const result = await publicRequest<MakePropertiesRequired<Product, K>>({
    method: "GET",
    path: `/products/${storeSlug}/${productSlug}/` + queryParams,
  });

  if (!result.success) {
    return null;
  }

  return result.data;
}

type CreateProductInputs = BaseForm & {
  slug: string;
  slug_with_store: string;
  variants: VariantType[];
  variant_combinations: VariantCombination[];
};
export async function createProduct(
  data: CreateProductInputs,
  storeSlug: string,
  token: string
) {
  return await protectedRequest<Product>({
    method: "POST",
    path: `/stores/${storeSlug}/products/`,
    token,
    data,
  });
}

export async function updateProduct(
  data: CreateProductInputs,
  storeSlug: string,
  productSlug: string,
  token: string
) {
  return await protectedRequest<Product>({
    method: "POST",
    path: `/stores/${storeSlug}/products/${productSlug}`,
    token,
    data,
  });
}

export async function deleteProduct(
  storeSlug: string,
  productSlug: string,
  token: string
) {
  return await protectedRequest<Product>({
    method: "DELETE",
    path: `/stores/${storeSlug}/products/${productSlug}`,
    token,
  });
}

export async function createProductImages(
  storeSlug: string,
  productSlug: string,
  data: FormData,
  token: string
) {
  return await protectedRequest<ProductImage[]>({
    method: "POST",
    path: `/stores/${storeSlug}/products/${productSlug}/images`,
    token,
    data,
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function deleteProductImage(
  storeSlug: string,
  productSlug: string,
  imageUrl: string,
  token: string
) {
  return await protectedRequest<{ id: string }>({
    method: "DELETE",
    path: `/stores/${storeSlug}/products/${productSlug}/images`,
    token,
    data: { image_url: imageUrl },
  });
}
