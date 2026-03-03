import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api/client";
import { queryKeys } from "./query-keys";
import type { Notification } from "../types/notification";

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

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      profileUid,
      notificationId,
    }: {
      profileUid: string;
      notificationId: number;
    }) =>
      api.request<string>("notifications/delete", {
        method: "DELETE",
        body: { profileUID: profileUid, notificationID: notificationId },
        requiresAuth: true,
        responseKey: "message",
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications(variables.profileUid),
      });
    },
  });
}

export function useMarkNotificationsViewed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      profileUid,
      notificationIds,
    }: {
      profileUid: string;
      notificationIds: number[];
    }) =>
      api.request("notifications/viewed", {
        method: "POST",
        body: { profileUID: profileUid, notificationIDs: notificationIds },
        requiresAuth: true,
        responseKey: "message",
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.unreadCount(variables.profileUid),
      });
    },
  });
}
