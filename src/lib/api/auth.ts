import { AuthResponse, User } from "@/types/User";
import { protectedRequest, publicRequest } from ".";
import axios from "../axios";

type ReqError = {
  errors?: { [key: string]: string[] }[];
  message: string;
};

export async function refreshToken(token: string) {
  return await protectedRequest({
    method: "POST",
    path: "/auth/refresh",
    token,
  })
    .then((res) => res.data)
    .catch((err) => {
      console.log("Error refreshToken", err?.response?.data);
      return err.response;
    });
}

export async function getUserInfo(token: string) {
  return await protectedRequest<User>({
    method: "GET",
    path: "/auth/me",
    token,
  })
    .then((res) => res.data)
    .catch((err) => {
      console.log("Error getUserInfo", err?.response?.data);
      return null;
    });
}

export async function loginUser(credentials?: {
  email: string;
  password: string;
}) {
  return await publicRequest<AuthResponse>({
    method: "POST",
    path: "/auth/login",
    data: credentials,
  })
    .then((res) => res.data)
    .catch((err) => {
      console.log("Error loginUser", err?.response?.data);
      return null;
    });
}

export async function registerUser(credentials?: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone_number: string;
}): Promise<{
  data?: AuthResponse;
  status?: number;
  error?: ReqError;
}> {
  return await publicRequest<AuthResponse>({
    method: "POST",
    path: "/auth/register",
    data: credentials,
  })
    .then((res) => ({ data: res.data, status: res.status, error: undefined }))
    .catch((err) => {
      console.log("Error registerUser", err);
      const error = err?.response?.data || { message: err.message } || {
          message: "Service Unavailable",
        };
      return {
        data: undefined,
        error: error,
        status: err?.response?.status || 500,
      };
    });
}
