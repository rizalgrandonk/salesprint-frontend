import { z } from "zod";
import { User } from "./User";

export type Store = {
  id: string;
  name: string;
  phone_number: string;
  slug: string;
  address: string;
  city: string;
  city_id: string;
  province: string;
  province_id: string;
  postal_code: string;
  status: "approved" | "on_review" | "rejected";
  image?: string;
  store_description?: string;
  total_balance: number;
  created_at: string;
  updated_at: string;

  store_banners?: StoreBanner[];
  store_categories?: StoreCategory[];
  user?: User;

  store_banners_count?: number;
  store_categories_count?: number;
  products_count?: number;
  reviews_count?: number;
  order_items_count?: number;
  orders_count?: number;

  reviews_avg_rating?: number;
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
    .max(50, "Domain toko tidak boleh lebih dari 50 karakter")
    .refine((val) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(val), {
      message: "Format Domain toko tidak sesuai",
    }),
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
    .max(150, "Kota tidak boleh lebih dari 50 karakter"),
  province_id: z
    .string({ required_error: "Provinsi harus diisi" })
    .trim()
    .min(1, "Provinsi harus diisi")
    .max(10, "Provinsi tidak boleh lebih dari 10 karakter"),
  province: z
    .string({ required_error: "Provinsi harus diisi" })
    .trim()
    .min(1, "Provinsi harus diisi")
    .max(50, "Provinsi tidak boleh lebih dari 50 karakter"),
  postal_code: z
    .string({ required_error: "Kode pos harus diisi" })
    .trim()
    .min(1, "Kode pos harus diisi")
    .max(10, "Kode pos tidak boleh lebih dari 10 karakter"),
});

export const editStoreSchema = createStoreSchema
  .partial({
    slug: true,
  })
  .extend({
    store_description: z
      .string({ required_error: "Nama harus diisi" })
      .trim()
      .max(1000, "Nama tidak boleh lebih dari 1000 karakter")
      .optional(),
  });

export type CreateStoreInputs = z.infer<typeof createStoreSchema>;
export type EditStoreInputs = z.infer<typeof editStoreSchema>;

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

  products_count?: number;
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
