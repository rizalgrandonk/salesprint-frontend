import { PaginatedData } from "@/types/data";
import { protectedRequest } from ".";
import { queryStringify } from "../formater";

type Notification = {
  id: string;
  type: string;
  notifiable_type: string;
  notifiable_id: number;
  data: {
    title: string;
    body: string;
    action_url?: string;
    [key: string]: string | undefined;
  };
  read_at?: string | null;
  created_at: string;
  updated_at: string;
};

export async function getUserNotifications(
  token: string,
  params: { page: number; type?: "read" | "unread" | "all"; limit?: number }
) {
  const paramList = params
    ? Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value != null)
      )
    : null;

  const paramSrting = paramList ? queryStringify(paramList) : null;

  const result = await protectedRequest<PaginatedData<Notification[]>>({
    method: "GET",
    path: `/notifications${paramSrting ? "?" + paramSrting : ""}`,
    token,
  });

  if (!result.success) {
    return null;
  }

  return result.data;
}

export async function getUserNotificationsCount(
  token: string,
  params?: { type?: "read" | "unread" | "all" }
) {
  const paramList = params
    ? Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value != null)
      )
    : null;

  const paramSrting = paramList ? queryStringify(paramList) : null;

  const result = await protectedRequest<{ count: number }>({
    method: "GET",
    path: `/notifications/count${paramSrting ? "?" + paramSrting : ""}`,
    token,
  });

  if (!result.success) {
    return null;
  }

  return result.data;
}

export async function markReadUserNotifications(token: string) {
  const result = await protectedRequest<{ updated_count: number }>({
    method: "GET",
    path: `/notifications/mark_read`,
    token,
  });

  if (!result.success) {
    return null;
  }

  return result.data;
}
