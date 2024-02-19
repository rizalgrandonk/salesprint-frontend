import { Review } from "@/types/Product";
import { protectedRequest } from ".";

export async function createReviews(
  token: string,
  data: {
    reviews: {
      rating: number;
      coment?: string;
      product_id: string;
      product_variant_id: string;
      order_item_id: string;
    }[];
  }
) {
  return await protectedRequest<Review[]>({
    method: "POST",
    path: `/reviews/create`,
    token: token,
    data: data,
  });
}
