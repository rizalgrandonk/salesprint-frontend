import { Product } from "@/types/Product";
import { publicRequest } from ".";

export async function getAllProducts() {
  return await publicRequest<Product[]>("GET", "/api/products/")
    .then((res) => res.data)
    .catch((err) => {
      console.log("Error refreshToken", err?.response?.data);
      return undefined;
    });
}
