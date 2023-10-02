export type VariantType = {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
};

export type VariantOption = {
    id: number;
    value: string;
    created_at: string;
    updated_at: string;
    variant_type: VariantType;
};

export type ProductVariant = {
    id: number;
    price: number;
    stok: number;
    created_at: string;
    updated_at: string;
    variant_options: VariantOption;
};
