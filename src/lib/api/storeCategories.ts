import { StoreCategory } from "@/types/Store";
import { QueryParams } from "@/types/data";
import { protectedRequest, publicRequest } from ".";
import { queryStateToQueryString } from "../formater";

export async function getStoreCategories(
  slug: string,
  params?: QueryParams<StoreCategory>
) {
  const queryParams = params ? "?" + queryStateToQueryString(params) : "";
  const result = await publicRequest<StoreCategory[]>({
    method: "GET",
    path: `/stores/${slug}/categories` + queryParams,
  });

  if (!result.success) {
    return null;
  }

  return result.data;
}

export async function createStoreCategory(
  slug: string,
  data: FormData,
  token: string
) {
  return await protectedRequest<StoreCategory>({
    method: "POST",
    path: `/stores/${slug}/categories`,
    token,
    data,
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function updateStoreCategory(
  storeSlug: string,
  bannerId: string,
  data: FormData,
  token: string
) {
  return await protectedRequest<StoreCategory>({
    method: "POST",
    path: `/stores/${storeSlug}/categories/${bannerId}`,
    token,
    data,
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function deleteStoreCategory(
  slug: string,
  id: string,
  token: string
) {
  return await protectedRequest<StoreCategory>({
    method: "DELETE",
    path: `/stores/${slug}/categories/${id}`,
    token,
    headers: { "Content-Type": "multipart/form-data" },
  });
}
