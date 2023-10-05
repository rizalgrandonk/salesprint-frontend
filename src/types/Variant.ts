export type VariantType = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type VariantOption = {
  id: string;
  value: string;
  created_at: string;
  updated_at: string;
  variant_type: VariantType;
};

export type ProductVariant = {
  id: string;
  price: number;
  stok: number;
  created_at: string;
  updated_at: string;
  variant_options: VariantOption;
};
