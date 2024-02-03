import { Category } from "@/types/Category";
import { QueryParams } from "@/types/data";
import { protectedRequest, publicRequest } from ".";
import { queryStateToQueryString } from "../formater";

export async function getAllCategories(params?: QueryParams<Category>) {
  const queryParams = params ? "?" + queryStateToQueryString(params) : "";
  const result = await publicRequest<Category[]>({
    method: "GET",
    path: "/categories" + queryParams,
  });

  if (!result.success) {
    return null;
  }

  return result.data;
}

export async function createCategory(data: FormData, token: string) {
  return await protectedRequest<Category>({
    method: "POST",
    path: `/categories`,
    token,
    data,
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function updateCategory(
  slug: string,
  data: FormData,
  token: string
) {
  return await protectedRequest<Category>({
    method: "POST",
    path: `/categories/${slug}`,
    token,
    data,
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function deleteCategory(slug: string, token: string) {
  return await protectedRequest<Category>({
    method: "DELETE",
    path: `/categories/${slug}`,
    token,
    headers: { "Content-Type": "multipart/form-data" },
  });
}
