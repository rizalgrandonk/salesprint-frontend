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
  image: string;
  created_at: string;
  updated_at: string;

  store_banners?: StoreBanner[];
  store_categories?: StoreCategory[];
};

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
