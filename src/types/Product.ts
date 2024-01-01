import { Category } from "./Category";
import { Store } from "./Store";
import { ProductVariant } from "./Variant";

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  stok: number;
  average_rating: number;
  created_at: string;
  updated_at: string;

  category_id: string;
  store_category_id?: string;

  product_images?: {
    id: number;
    image_url: string;
    main_image: boolean;
    product_id: number;
    created_at: string;
    updated_at: string;
  }[];
  category?: Category;
  store_category?: Category;
  store?: Store;
  product_variants?: ProductVariant;

  product_variants_count?: number;
  reviews_count?: number;
};
