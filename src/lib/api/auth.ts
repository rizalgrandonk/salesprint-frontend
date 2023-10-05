import { AuthResponse } from "@/types/User";
import { protectedRequest, publicRequest } from ".";
import axios from "../axios";

export async function refreshToken(token: string) {
  return await protectedRequest({
    method: "POST",
    path: "/api/auth/refresh",
    token,
  })
    .then((res) => res.data)
    .catch((err) => {
      console.log("Error refreshToken", err?.response?.data);
      return err.response;
    });
}

export async function loginUser(credentials?: {
  email: string;
  password: string;
}) {
  return await publicRequest<AuthResponse>({
    method: "POST",
    path: "/api/auth/login",
    data: credentials,
  })
    .then((res) => res.data)
    .catch((err) => {
      console.log("Error loginUser", err?.response?.data);
      return undefined;
    });
}
