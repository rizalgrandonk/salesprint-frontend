import { City, CreateStoreInputs, Province, Store } from "@/types/Store";
import { protectedRequest, publicRequest } from ".";

// type RequestResult =
//   | { success: true; data: Store }
//   | { success: false; error: string };

export async function getUserStore(token?: string) {
  if (!token) {
    return null;
  }
  const result = await protectedRequest<Store>({
    method: "GET",
    path: "/stores/mystore",
    token,
  });

  if (!result.success) {
    return null;
  }

  return result.data;
}

export async function createStore(data: CreateStoreInputs, token: string) {
  return await protectedRequest<Store>({
    method: "POST",
    path: "/stores",
    token,
    data,
  });
}

export async function updateStore(slug: string, data: FormData, token: string) {
  return await protectedRequest<Store>({
    method: "POST",
    path: `/stores/${slug}`,
    token,
    data,
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function getStoreBySlug(slug: string, signal?: AbortSignal) {
  const result = await publicRequest<Store>(
    {
      method: "GET",
      path: `/stores/${slug}`,
    },
    { signal: signal }
  );

  if (!result.success) {
    return null;
  }

  return result.data;
}

export async function createStoreBanner(
  slug: string,
  data: FormData,
  token: string
) {
  console.log(data);
  return await protectedRequest<Store>({
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
  return await protectedRequest<Store>({
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
  return await protectedRequest<Store>({
    method: "DELETE",
    path: `/stores/${slug}/banners/${id}`,
    token,
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function getProvince() {
  const result = await publicRequest<Province[]>({
    method: "GET",
    path: `/province`,
  });

  if (!result.success) {
    return null;
  }

  return result.data;
}

export async function getCities(provinceId?: string) {
  if (!provinceId) {
    return null;
  }

  const result = await publicRequest<City[]>({
    method: "GET",
    path: `/city`,
    params: { province_id: provinceId },
  });

  if (!result.success) {
    return null;
  }

  return result.data;
}
