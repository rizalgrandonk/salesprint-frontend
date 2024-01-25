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
  product_id: string;
  updated_at: string;
  variant_type?: VariantType;
  product_variants?: ProductVariant[];
  pivot?: Pivot;
};

export type ProductVariant = {
  id: string;
  price: number;
  stok: number;
  sku: string;
  product_id: string;
  created_at: string;
  updated_at: string;
  variant_options?: VariantOption[];
  pivot?: Pivot;
};

type Pivot = {
  created_at: string;
  id: string;
  product_variant_id: string;
  updated_at: string;
  variant_option_id: string;
};
