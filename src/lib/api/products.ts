import { Product } from "@/types/Product";
import { publicRequest } from ".";

export async function getAllProducts() {
  const result = await publicRequest<Product[]>({
    method: "GET",
    path: "/products/",
  });

  if (!result.success) {
    return null;
  }

  return result.data;
}
