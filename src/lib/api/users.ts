import { User } from "@/types/User";
import { protectedRequest } from ".";

export async function updateUser(id: string, data: FormData, token: string) {
  return await protectedRequest<User>({
    method: "POST",
    path: `/users/${id}`,
    token,
    data,
    headers: { "Content-Type": "multipart/form-data" },
  });
}
