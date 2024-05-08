import { Order } from "./Order";

export type Withdraw = {
  id: string;
  total_amount: number;
  bank_code: string;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  status: "PAID" | "PENDING" | "DENIED";
  denied_reason: string;
  receipt: string;
  store_id: string;
  created_at: string;
  updated_at: string;

  orders?: Order[];

  orders_count?: number;
};
