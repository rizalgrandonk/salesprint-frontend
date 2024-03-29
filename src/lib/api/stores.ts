import { City, CreateStoreInputs, Province, Store } from "@/types/Store";
import {
  MakePropertiesRequired,
  PaginatedData,
  QueryParams,
} from "@/types/data";
import { protectedRequest, publicRequest } from ".";
import { queryStateToQueryString, queryStringify } from "../formater";

// type RequestResult =
//   | { success: true; data: Store }
//   | { success: false; error: string };

export async function getPaginatedStores(params?: string) {
  const result = await publicRequest<PaginatedData<Store[]>>({
    method: "GET",
    path: `/paginated/stores${params ? "?" + params : ""}`,
  });

  if (!result.success) {
    return null;
  }

  return result.data;
}

export async function getUserStore<K extends keyof Store>(
  token?: string,
  params?: QueryParams<Store>
) {
  if (!token) {
    return null;
  }
  const queryParams = params ? "?" + queryStateToQueryString(params) : "";
  const result = await protectedRequest<MakePropertiesRequired<Store, K>>({
    method: "GET",
    path: "/stores/mystore" + queryParams,
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

export async function updateStoreStatus(
  slug: string,
  data: { status: Store["status"] },
  token: string
) {
  return await protectedRequest<Store>({
    method: "POST",
    path: `/stores/${slug}/update_store_status`,
    token,
    data,
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function getStoreBySlug<K extends keyof Store>(
  slug: string,
  params?: QueryParams<Store>
) {
  const queryParams = params ? "?" + queryStateToQueryString(params) : "";
  const result = await publicRequest<MakePropertiesRequired<Store, K>>({
    method: "GET",
    path: `/stores/${slug}` + queryParams,
  });

  if (!result.success) {
    return null;
  }

  return result.data;
}
