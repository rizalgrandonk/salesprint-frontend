import { Product } from "@/types/Product";
import { protectedRequest } from ".";
import { queryStringify } from "../formater";
import { Store } from "@/types/Store";

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

export async function getStoreOrderStatusount(token: string) {
  const result = await protectedRequest<
    {
      order_status: string;
      count: number;
    }[]
  >({
    method: "GET",
    path: "/dashboard/store_order_status_count",
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

export async function getStoreTopOrderProvince(token: string) {
  const result = await protectedRequest<
    {
      delivery_province: string;
      count: number;
    }[]
  >({
    method: "GET",
    path: "/dashboard/store_order_top_province",
    token: token,
  });

  if (!result.success) {
    return null;
  }

  return result.data;
}

export async function getStoreTopOrderProducts(token: string) {
  const result = await protectedRequest<
    (Product & {
      product_images: Product["product_images"];
      total_orders: number;
      order_count: number;
    })[]
  >({
    method: "GET",
    path: "/dashboard/store_order_top_products",
    token: token,
  });

  if (!result.success) {
    return null;
  }

  return result.data;
}

export async function getStoreTopOrderCustomers(token: string) {
  const result = await protectedRequest<
    {
      user_name: string;
      user_image: string;
      total_orders: number;
      order_count: number;
    }[]
  >({
    method: "GET",
    path: "/dashboard/store_order_top_customers",
    token: token,
  });

  if (!result.success) {
    return null;
  }

  return result.data;
}

export async function getAdminProductsCount(token: string) {
  const result = await protectedRequest<{
    count: number;
  }>({
    method: "GET",
    path: "/dashboard/admin_products_count",
    token: token,
  });

  if (!result.success) {
    return null;
  }

  return result.data;
}

export async function getAdminStoresCount(token: string) {
  const result = await protectedRequest<{
    count: number;
  }>({
    method: "GET",
    path: "/dashboard/admin_stores_count",
    token: token,
  });

  if (!result.success) {
    return null;
  }

  return result.data;
}

export async function getAdminUsersCount(token: string) {
  const result = await protectedRequest<{
    count: number;
  }>({
    method: "GET",
    path: "/dashboard/admin_users_count",
    token: token,
  });

  if (!result.success) {
    return null;
  }

  return result.data;
}

export async function getAdmincategoriesCount(token: string) {
  const result = await protectedRequest<{
    count: number;
  }>({
    method: "GET",
    path: "/dashboard/admin_categories_count",
    token: token,
  });

  if (!result.success) {
    return null;
  }

  return result.data;
}

export async function getAdminTopOrderProducts(token: string) {
  const result = await protectedRequest<
    (Product & {
      product_images: Product["product_images"];
      total_orders: number;
      order_count: number;
    })[]
  >({
    method: "GET",
    path: "/dashboard/admin_order_top_products",
    token: token,
  });

  if (!result.success) {
    return null;
  }

  return result.data;
}
export async function getAdminTopOrderStores(token: string) {
  const result = await protectedRequest<
    (Store & {
      total_orders: number;
      order_count: number;
    })[]
  >({
    method: "GET",
    path: "/dashboard/admin_order_top_stores",
    token: token,
  });

  if (!result.success) {
    return null;
  }

  return result.data;
}

export async function getAdminTopReviewProducts(token: string) {
  const result = await protectedRequest<
    (Product & {
      reviews_count: number;
    })[]
  >({
    method: "GET",
    path: "/dashboard/admin_review_top_products",
    token: token,
  });

  if (!result.success) {
    return null;
  }

  return result.data;
}

export async function getAdminTopReviewStores(token: string) {
  const result = await protectedRequest<
    (Store & {
      reviews_avg_rating: number;
      reviews_count: number;
    })[]
  >({
    method: "GET",
    path: "/dashboard/admin_review_top_stores",
    token: token,
  });

  if (!result.success) {
    return null;
  }

  return result.data;
}
