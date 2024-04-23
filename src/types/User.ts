import { z } from "zod";

export type User = {
  id: string;
  name: string;
  username: string;
  image: string | null;
  email: string;
  role: string;
  email_verified_at: string | null;
  phone_number: string;
  created_at: string;
  updated_at: string;
};

export type EditUserForm = {
  name: string;
  phone_number: string;
  username: string;
  email: string;
  image: string | null;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
};

export const editUserSchema = z.object({
  name: z
    .string({ required_error: "Nama harus diisi" })
    .trim()
    .min(1, "Nama harus diisi")
    .max(50, "Nama tidak boleh lebih dari 50 karakter"),
  phone_number: z
    .string({ required_error: "Nomor telepon harus diisi" })
    .trim()
    .min(1, "Nomor telepon harus diisi")
    .max(20, "Nomor telepon tidak boleh lebih dari 20 karakter"),
  username: z
    .string({ required_error: "Nama Pengguna harus diisi" })
    .trim()
    .min(3, "Nama Pengguna harus diisi")
    .max(50, "Nama Pengguna tidak boleh lebih dari 50 karakter")
    .regex(/^[a-z0-9_]+$/, "Format nama pengguna tidak sesuai"),
  email: z
    .string({ required_error: "Email Pengguna harus diisi" })
    .email()
    .trim()
    .min(1, "Email Pengguna harus diisi")
    .max(50, "Email Pengguna tidak boleh lebih dari 50 karakter"),
});
