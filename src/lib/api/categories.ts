import { Category } from "@/types/Category";
import { publicRequest } from ".";

export async function getAllCategories() {
  const result = await publicRequest<Category[]>({
    method: "GET",
    path: "/categories/",
  });

  if (!result.success) {
    return null;
  }

  return result.data;
}
