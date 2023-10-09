import { Store } from "@/types/Store";
import { protectedRequest } from ".";

export async function getUserStore(token?: string) {
  if (!token) {
    return undefined;
  }
  return await protectedRequest<Store>({
    method: "GET",
    path: "/mystore",
    token,
  })
    .then((res) => res.data)
    .catch((err) => {
      console.log("Error getUserStore", err?.response?.data);
      return undefined;
    });
}
