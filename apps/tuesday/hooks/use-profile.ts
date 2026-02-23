import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api/client";
import { queryKeys } from "./query-keys";
import type { Profile } from "../types/profile";

export function useProfile(uid: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.profile(uid),
    queryFn: () =>
      api.request<Profile>("profile/agent", {
        query: { profileUID: uid },
        requiresAuth: true,
        responseKey: "message",
      }),
    enabled: enabled && !!uid,
  });
}

export function useFollowings(uid: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.followings(uid),
    queryFn: () =>
      api.request<Profile[]>("follow/followings", {
        method: "POST",
        body: { profileUID: uid },
        requiresAuth: true,
        responseKey: "message",
      }),
    enabled: enabled && !!uid,
  });
}

export function useFollowMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      profileUid,
      targetUid,
      follow,
    }: {
      profileUid: string;
      targetUid: string;
      follow: boolean;
    }) =>
      api.request<string>(follow ? "follow" : "unfollow", {
        method: "POST",
        body: { profileUID: profileUid, followUID: targetUid },
        responseKey: "message",
      }),

    onSettled: (_data, _error, { profileUid }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.followings(profileUid),
      });
    },
  });
}
