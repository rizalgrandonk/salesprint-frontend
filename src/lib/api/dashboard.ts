import { protectedRequest } from ".";
import { queryStringify } from "../formater";

export async function getStoreSales(token: string, years: number[]) {
  const queryParams = queryStringify({ years: years });
  const result = await protectedRequest<
    {
      year: number;
      data: {
        period: number;
        total: number;
      }[];
    }[]
  >({
    method: "GET",
    path: `/dashboard/store_sales?${queryParams}`,
    token: token,
  });

  if (!result.success) {
    return null;
  }

  return result.data;
}

export async function getStoreSalesSummay(token: string) {
  const result = await protectedRequest<{
    current_month: number;
    last_month: number;
    difference: number;
    percentage_difference: number;
  }>({
    method: "GET",
    path: "/dashboard/store_sales_summary",
    token: token,
  });

  if (!result.success) {
    return null;
  }

  return result.data;
}

export async function getStoreOrderSummay(token: string) {
  const result = await protectedRequest<{
    current_month: number;
    last_month: number;
    difference: number;
    percentage_difference: number;
  }>({
    method: "GET",
    path: "/dashboard/store_order_summary",
    token: token,
  });

  if (!result.success) {
    return null;
  }

  return result.data;
}

export async function getStoreRatingSummay(token: string) {
  const result = await protectedRequest<{
    current_month: number;
    last_month: number;
    difference: number;
    percentage_difference: number;
  }>({
    method: "GET",
    path: "/dashboard/store_rating_summary",
    token: token,
  });

  if (!result.success) {
    return null;
  }

  return result.data;
}

export async function getStoreTopOrderMethods(token: string) {
  const result = await protectedRequest<
    {
      payment_type: string;
      count: number;
    }[]
  >({
    method: "GET",
    path: "/dashboard/store_order_top_methods",
    token: token,
  });

  if (!result.success) {
    return null;
  }

  return result.data;
}
