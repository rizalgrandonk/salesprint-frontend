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
