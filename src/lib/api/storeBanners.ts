import { StoreBanner } from "@/types/Store";
import { protectedRequest } from ".";

export async function createStoreBanner(
  slug: string,
  data: FormData,
  token: string
) {
  console.log(data);
  return await protectedRequest<StoreBanner>({
    method: "POST",
    path: `/stores/${slug}/banners`,
    token,
    data,
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function updateStoreBanner(
  storeSlug: string,
  bannerId: string,
  data: FormData,
  token: string
) {
  console.log(data);
  return await protectedRequest<StoreBanner>({
    method: "POST",
    path: `/stores/${storeSlug}/banners/${bannerId}`,
    token,
    data,
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function deleteStoreBanner(
  slug: string,
  id: string,
  token: string
) {
  return await protectedRequest<StoreBanner>({
    method: "DELETE",
    path: `/stores/${slug}/banners/${id}`,
    token,
    headers: { "Content-Type": "multipart/form-data" },
  });
}
