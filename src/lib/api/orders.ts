import { Order, Transaction } from "@/types/Order";
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

export async function acceptOrder(
  token: string,
  data: { order_number: string }
) {
  return await protectedRequest<Order>({
    method: "POST",
    path: `/orders/accept_order`,
    token: token,
    data: data,
  });
}

export async function shipOrder(
  token: string,
  data: {
    order_number: string;
    shipping_tracking_number: string;
    shipping_days_estimate: number;
  }
) {
  return await protectedRequest<Order>({
    method: "POST",
    path: `/orders/ship_order`,
    token: token,
    data: data,
  });
}

export async function deliveredOrder(
  token: string,
  data: { order_number: string }
) {
  return await protectedRequest<Order>({
    method: "POST",
    path: `/orders/delivered_order`,
    token: token,
    data: data,
  });
}

export async function cancelOrder(
  token: string,
  data: { order_number: string; cancel_reason: string }
) {
  return await protectedRequest<Order>({
    method: "POST",
    path: `/orders/cancel_order`,
    token: token,
    data: data,
  });
}
