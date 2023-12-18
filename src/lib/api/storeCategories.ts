import { StoreCategory } from "@/types/Store";
import { publicRequest } from ".";

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
