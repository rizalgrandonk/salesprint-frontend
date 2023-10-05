import { Category } from "@/types/Category";
import { publicRequest } from ".";

export async function getAllCategories() {
  return await publicRequest<Category[]>({
    method: "GET",
    path: "/api/categories/",
  })
    .then((res) => res.data)
    .catch((err) => {
      console.log("Error getAllCategories", err?.response?.data);
      return undefined;
    });
}
