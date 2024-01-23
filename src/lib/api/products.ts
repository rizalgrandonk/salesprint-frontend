import {
  BaseForm,
  Product,
  ProductImage,
  VariantCombination,
  VariantType,
} from "@/types/Product";
import { protectedRequest, publicRequest } from ".";

export async function getAllProducts(
  params?: Record<string, string | string[]>
) {
  const result = await publicRequest<Product[]>({
    method: "GET",
    path: "/products/",
    params: params,
  });

  if (!result.success) {
    return null;
  }

  return result.data;
}

export async function getProduct(
  storeSlug: string,
  productSlug: string,
  params?: Record<string, string | string[]>
) {
  const result = await publicRequest<Product>({
    method: "GET",
    path: `/products/${storeSlug}/${productSlug}/`,
    params: params,
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
