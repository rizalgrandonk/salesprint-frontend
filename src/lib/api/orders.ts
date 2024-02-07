import { Transaction } from "@/types/Order";
import { protectedRequest } from ".";

type GetTokenData = {
  orders: {
    store_id: string;
    shipping: {
      shipping_courier: string;
      delivery_service: string;
      delivery_cost: number;
    };
    items: {
      id: string;
      product_variant_id: string;
      quantity: number;
    }[];
  }[];
  shipping_detail: {
    reciever_name: string;
    reciever_phone: string;
    delivery_province_id: string;
    delivery_province: string;
    delivery_city_id: string;
    delivery_city: string;
    delivery_postal_code: string;
    delivery_address: string;
  };
};

export async function getTransactionToken(token: string, data: GetTokenData) {
  return await protectedRequest<{
    token: string;
    transaction: Transaction;
  }>({
    method: "POST",
    path: `/orders/get_token`,
    token: token,
    data: data,
  });
}

export async function updateTransactionByToken(
  token: string,
  snapToken: string,
  data: Partial<Transaction>
) {
  return await protectedRequest<Transaction>({
    method: "POST",
    path: `/orders/update_transaction_by_token?snap_token=${snapToken}`,
    token: token,
    data: data,
  });
}
