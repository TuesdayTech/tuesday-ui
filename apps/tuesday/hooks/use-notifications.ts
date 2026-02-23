import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api/client";
import { queryKeys } from "./query-keys";

interface Notification {
  id: number;
  UID?: string;
  profileUID?: string;
  type?: string;
  title?: string;
  body?: string;
  isViewed?: boolean;
  createdAt?: string;
}

export function useNotifications(profileUid: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.notifications(profileUid),
    queryFn: () =>
      api.request<Notification[]>("notifications", {
        query: { profileUID: profileUid },
        requiresAuth: true,
        responseKey: "message",
      }),
    enabled: enabled && !!profileUid,
  });
}

export function useUnreadCount(profileUid: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.unreadCount(profileUid),
    queryFn: () =>
      api.request<number>("notifications/unread", {
        query: { profileUID: profileUid },
        requiresAuth: true,
        responseKey: "message",
      }),
    enabled: enabled && !!profileUid,
    refetchInterval: 60 * 1000, // Poll every 60s
  });
}
