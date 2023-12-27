import { PaginatedData } from "@/types/data";
import { publicRequest } from ".";

export async function getPaginatedData<T>(
  path: string,
  params?: string,
  token?: string
) {
  const result = await publicRequest<PaginatedData<T[]>>({
    method: "GET",
    path: `${path}${params ? "?" + params : ""}`,
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  });

  if (!result.success) {
    return null;
  }

  return result.data;
}
