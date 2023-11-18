import { z } from "zod";

export type Store = {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  city_id: string;
  province: string;
  province_id: string;
  postal_code: string;
  status: string;
  image?: string;
  store_description?: string;
  created_at: string;
  updated_at: string;

  store_banners?: StoreBanner[];
  store_categories?: StoreCategory[];
};

export const createStoreSchema = z.object({
  name: z
    .string({ required_error: "Nama harus diisi" })
    .trim()
    .min(1, "Nama harus diisi")
    .max(50, "Nama tidak boleh lebih dari 50 karakter"),
  slug: z
    .string({ required_error: "Domain toko harus diisi" })
    .trim()
    .min(1, "Domain toko harus diisi")
    .max(50, "Domain toko tidak boleh lebih dari 50 karakter"),
  phone_number: z
    .string({ required_error: "Nomor telepon harus diisi" })
    .trim()
    .min(1, "Nomor telepon harus diisi")
    .max(20, "Nomor telepon tidak boleh lebih dari 20 karakter"),
  address: z
    .string({ required_error: "Alamat harus diisi" })
    .trim()
    .min(1, "Alamat harus diisi")
    .max(100, "Alamat tidak boleh lebih dari 100 karakter"),
  city_id: z
    .string({ required_error: "Kota harus diisi" })
    .trim()
    .min(1, "Kota harus diisi")
    .max(10, "Kota tidak boleh lebih dari 10 karakter"),
  city: z
    .string({ required_error: "Kota harus diisi" })
    .trim()
    .min(1, "Kota harus diisi")
    .max(10, "Kota tidak boleh lebih dari 10 karakter"),
  province_id: z
    .string({ required_error: "Provinsi harus diisi" })
    .trim()
    .min(1, "Provinsi harus diisi")
    .max(10, "Provinsi tidak boleh lebih dari 10 karakter"),
  province: z
    .string({ required_error: "Provinsi harus diisi" })
    .trim()
    .min(1, "Provinsi harus diisi")
    .max(10, "Provinsi tidak boleh lebih dari 10 karakter"),
  postal_code: z
    .string({ required_error: "Kode pos harus diisi" })
    .trim()
    .min(1, "Kode pos harus diisi")
    .max(10, "Kode pos tidak boleh lebih dari 10 karakter"),
});

export type CreateStoreInputs = z.infer<typeof createStoreSchema>;

export type StoreBanner = {
  id: string;
  image: string;
  description?: string;
};

export type StoreCategory = {
  id: string;
  name: string;
  slug: string;
  image?: string;
};

export type Province = {
  province_id: string;
  province: string;
};

export type City = {
  city_id: string;
  province_id: string;
  province: string;
  type: string;
  city_name: string;
  postal_code: string;
};
