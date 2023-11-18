import { City, CreateStoreInputs, Province, Store } from "@/types/Store";
import { RequestError, protectedRequest, publicRequest } from ".";

type RequestResult =
  | { success: true; data: Store }
  | { success: false; error: string };

export async function getUserStore(token?: string) {
  if (!token) {
    return null;
  }
  return await protectedRequest<Store>({
    method: "GET",
    path: "/stores/mystore",
    token,
  })
    .then((res) => res.data)
    .catch((err) => {
      console.log("Error getUserStore", err?.response?.data);
      return null;
    });
}

export async function createStore(
  data: CreateStoreInputs,
  token?: string
): Promise<RequestResult> {
  if (!token) {
    return { success: false, error: "Unauthorize" };
  }
  return await protectedRequest<Store>({
    method: "POST",
    path: "/stores/create",
    token,
    data,
  })
    .then((res) => ({
      success: <true>true,
      data: res.data,
    }))
    .catch((err) => {
      console.log("Error createStore", err?.response?.data);
      return {
        success: false,
        error: err?.response?.data?.message || "Error createStore",
      };
    });
}

export async function getStoreBySlug(slug: string, signal?: AbortSignal) {
  return await publicRequest<Store>(
    {
      method: "GET",
      path: `/stores/${slug}`,
    },
    { signal: signal }
  )
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
      return null;
    });
}

export async function getProvince() {
  return await publicRequest<Province[]>({
    method: "GET",
    path: `/stores/get_province`,
  })
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
      return null;
    });
}

export async function getCities(provinceId?: string) {
  if (!provinceId) {
    return null;
  }
  return await publicRequest<City[]>({
    method: "GET",
    path: `/stores/get_cities`,
    params: { province_id: provinceId },
  })
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
      return null;
    });
}
