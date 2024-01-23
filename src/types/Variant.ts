export type VariantType = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type VariantOption = {
  id: string;
  value: string;
  variant_type_id: string;
  created_at: string;
  updated_at: string;
  variant_type: VariantType;
};

export type ProductVariant = {
  id: string;
  price: number;
  stok: number;
  sku: string;
  created_at: string;
  updated_at: string;
  variant_options: VariantOption[];
};
