import { AuthResponse, User } from "@/types/User";
import { protectedRequest, publicRequest } from ".";

type ReqError = {
  errors?: { [key: string]: string[] }[];
  message: string;
};

export async function refreshToken(token: string) {
  return await protectedRequest<AuthResponse>({
    method: "POST",
    path: "/auth/refresh",
    token,
  });
}

export async function getUserInfo(token: string) {
  const result = await protectedRequest<User>({
    method: "GET",
    path: "/auth/me",
    token,
  });

  if (!result.success) {
    return null;
  }

  return result.data;
}

export async function loginUser(credentials?: {
  email: string;
  password: string;
}) {
  return await publicRequest<AuthResponse>({
    method: "POST",
    path: "/auth/login",
    data: credentials,
  });
}

export async function registerUser(credentials?: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone_number: string;
}) {
  return await publicRequest<AuthResponse>({
    method: "POST",
    path: "/auth/register",
    data: credentials,
  });
}
