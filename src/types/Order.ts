import { Product } from "./Product";
import { Store } from "./Store";
import { User } from "./User";
import { ProductVariant } from "./Variant";

export const ORDER_STATUS_MAP = {
  UNPAID: "Belum Dibayar",
  PAID: "Menunggu Konfirmasi",
  PROCESSED: "Diproses",
  SHIPPED: "Dikirim",
  DELIVERED: "Telah Dikirim",
  COMPLETED: "Selesai",
  CANCELED: "Dibatalkan",
};

export type OrderItem = {
  id: string;
  quantity: number;
  product_id: string;
  product_variant_id: string;
  order_id: string;
  created_at: string;
  updated_at: string;

  product?: Product;
  product_variant?: ProductVariant;
  order: Order;
};

export type Order = {
  id: string;
  order_number: string;
  total: number;
  order_status: keyof typeof ORDER_STATUS_MAP;
  shipping_status: string;
  cancel_reason?: string;
  shipping_tracking_number?: string;
  shipping_courier: string;
  shipping_history?: {
    date: string;
    desc: string;
    location: string;
  }[];
  reciever_name: string;
  reciever_phone: string;
  delivery_province_id: string;
  delivery_province: string;
  delivery_city_id: string;
  delivery_city: string;
  delivery_postal_code: string;
  delivery_address: string;
  delivery_service: string;
  delivery_cost: number;
  user_id: string;
  store_id: string;
  transaction_id: string;
  created_at: string;
  updated_at: string;

  shipping_days_estimate?: number;
  accept_deadline?: string;
  shipping_deadline?: string;
  deliver_deadline?: string;
  recieve_deadline?: string;

  paid_at?: string;
  accepted_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  completed_at?: string;
  canceled_at?: string;

  user?: User;
  store?: Store;
  transaction?: Transaction;
  order_items?: OrderItem[];
};

export type Transaction = {
  id: string;
  total: number;
  serial_order: string;
  transaction_id?: string;
  snap_token?: string;
  payment_status: string;
  status_message: string;
  status_code: string;
  payment_type?: string;
  payment_code?: string;
  pdf_url?: string;
  user_id: string;
  created_at: string;
  updated_at: string;

  user?: User;
  orders: Order[];
};
