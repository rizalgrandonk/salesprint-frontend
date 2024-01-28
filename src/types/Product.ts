import { z } from "zod";
import { Category } from "./Category";
import { Store } from "./Store";
import { User } from "./User";
import { ProductVariant } from "./Variant";

export type ProductImage = {
  id: number;
  image_url: string;
  main_image: boolean;
  product_id: number;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  slug: string;
  slug_with_store: string;
  name: string;
  description: string;
  price: number;
  stok: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  average_rating: number;
  created_at: string;
  updated_at: string;

  category_id: string;
  store_category_id?: string;

  product_images?: ProductImage[];
  category?: Category;
  store_category?: Category;
  store?: Store;
  product_variants?: ProductVariant[];
  reviews?: Review[];

  product_variants_count?: number;
  reviews_count?: number;
  order_items_count?: number;
};

export type Review = {
  id: string;
  coment: string;
  rating: number;
  product_id: string;
  user_id: string;
  product_variant_id: string;
  created_at: string;
  updated_at: string;

  user?: User;
};

export type VariantType = {
  variant_type: string;
  variant_options: string[];
};

export type VariantCombination = {
  [key: string]: string;
  price: string;
  stok: string;
  sku: string;
};

export const baseSchema = z.object({
  name: z
    .string({ required_error: "Nama harus diisi" })
    .trim()
    .min(1, "Nama harus diisi")
    .max(100, "Nama tidak boleh lebih dari 100 karakter"),
  description: z
    .string({ required_error: "Deskripsi harus diisi" })
    .trim()
    .min(1, "Deskripsi harus diisi")
    .max(5000, "Deskripsi tidak boleh lebih dari 5000 karakter"),
  category_id: z
    .string({ required_error: "Kategori harus diisi" })
    .trim()
    .min(1, "Kategori harus diisi"),
  store_category_id: z.string().trim().nullable().optional(),
  weight: z.coerce
    .number({ required_error: "Berat harus diisi" })
    .gt(0, "Kurang dari batas minimal")
    .lt(100000, "Melebihi batas makasimal"),
  length: z.coerce
    .number({ required_error: "Berat harus diisi" })
    .gt(0, "Kurang dari batas minimal")
    .lt(10000, "Melebihi batas makasimal"),
  width: z.coerce
    .number({ required_error: "Berat harus diisi" })
    .gt(0, "Kurang dari batas minimal")
    .lt(10000, "Melebihi batas makasimal"),
  height: z.coerce
    .number({ required_error: "Berat harus diisi" })
    .gt(0, "Kurang dari batas minimal")
    .lt(10000, "Melebihi batas makasimal"),
});

export type BaseForm = z.infer<typeof baseSchema>;
