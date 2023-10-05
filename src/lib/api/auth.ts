import { AuthResponse } from "@/types/User";
import { protectedRequest, publicRequest } from ".";
import axios from "../axios";

type ReqError = {
  errors: { [key: string]: string[] }[];
  message: string;
};

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

export async function registerUser(credentials?: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone_number: string;
}): Promise<{ data?: AuthResponse; status?: number; error?: ReqError }> {
  return await publicRequest<AuthResponse>({
    method: "POST",
    path: "/api/auth/register",
    data: credentials,
  })
    .then((res) => ({ data: res.data, status: res.status, error: undefined }))
    .catch((err) => {
      console.log("Error registerUser", err?.response?.data);
      return {
        data: undefined,
        error: err?.response?.data,
        status: err?.response?.status,
      };
    });
}
