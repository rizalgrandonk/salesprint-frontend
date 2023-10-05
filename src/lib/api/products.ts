import { Product } from "@/types/Product";
import { publicRequest } from ".";

export async function getAllProducts() {
  return await publicRequest<Product[]>({
    method: "GET",
    path: "/api/products/",
  })
    .then((res) => res.data)
    .catch((err) => {
      console.log("Error getAllProducts", err?.response?.data);
      return undefined;
    });
}
