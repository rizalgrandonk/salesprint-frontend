import { StoreCategory } from "@/types/Store";
import { protectedRequest, publicRequest } from ".";

export async function getStoreCategories(slug: string) {
  const result = await publicRequest<StoreCategory[]>({
    method: "GET",
    path: `/stores/${slug}/categories`,
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
  console.log(data);
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
  console.log(data);
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
