import { Product } from "./Product";

export type Category = {
  id: string;
  name: string;
  slug: string;
  image: string;
  created_at: string;
  updated_at: string;
  products?: Product[];
  products_count?: number;
};
