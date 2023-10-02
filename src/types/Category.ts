import { Product } from "./Product";

export type Category = {
    id: number;
    name: string;
    slug: string;
    image: string;
    created_at: string;
    updated_at: string;
    products?: Product[];
};
