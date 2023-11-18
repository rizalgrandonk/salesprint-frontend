import { Product } from "@/types/Product";
import { publicRequest } from ".";

export async function getAllProducts() {
  return await publicRequest<Product[]>({
    method: "GET",
    path: "/products/",
  })
    .then((res) => res.data)
    .catch((err) => {
      console.log("Error getAllProducts", err?.response?.data);
      return null;
    });
}
