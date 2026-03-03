import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api/client";
import { FEED_PAGE_SIZE } from "../lib/api/constants";
import { queryKeys } from "./query-keys";
import type {
  Profile,
  FollowerResponse,
  Office,
  ProfileSortOrder,
  UploadAvatarResponse,
} from "../types/profile";
import type { Listing } from "../types/listing";

export function useProfile(uid: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.profile(uid),
    queryFn: () =>
      api.request<Profile>("profile/agent", {
        query: { profileUID: uid },
        requiresAuth: true,
        responseKey: null,
      }),
    enabled: enabled && !!uid,
  });
}

export function useOwnProfile(uid: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.profile(uid),
    queryFn: () =>
      api.request<Profile>("profile/agent", {
        requiresAuth: true,
        responseKey: null,
      }),
    enabled: enabled && !!uid,
  });
}

const SORT_API_VALUE: Record<ProfileSortOrder, string> = {
  recent: "Recent",
  highest: "CurrentPrice",
};

export function useProfileListings(
  uid: string,
  sort: ProfileSortOrder = "recent",
  enabled = true,
) {
  return useInfiniteQuery({
    queryKey: queryKeys.profileListings(uid, sort),
    queryFn: async ({ pageParam = 0 }) => {
      const listings = await api.request<Listing[]>("profile/agent/listings/updated", {
        method: "POST",
        body: {
          profileUID: uid,
          limit: FEED_PAGE_SIZE,
          offset: pageParam,
          filters: { orderFilter: SORT_API_VALUE[sort] },
        },
        requiresAuth: true,
        responseKey: null,
      });

      return {
        listings: listings ?? [],
        offset: pageParam as number,
        nextOffset:
          listings && listings.length === FEED_PAGE_SIZE
            ? (pageParam as number) + FEED_PAGE_SIZE
            : undefined,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    enabled: enabled && !!uid,
  });
}

export function useFollowers(uid: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.followers(uid),
    queryFn: () =>
      api.request<FollowerResponse[]>("follow/followers", {
        method: "POST",
        body: { profileUID: uid },
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

export function useOffice(profileUid: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.office(profileUid),
    queryFn: () =>
      api.request<Office>("follow/office", {
        query: { profileUID: profileUid },
        requiresAuth: true,
        responseKey: "message",
      }),
    enabled: enabled && !!profileUid,
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
        body: {
          profileUID: profileUid,
          profiles: [{ UID: targetUid }],
        },
        responseKey: "message",
      }),

    onSettled: (_data, _error, { profileUid, targetUid }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.followings(profileUid),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.profile(targetUid),
      });
    },
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: Record<string, unknown>) =>
      api.request<Profile>("profile/agent/update", {
        method: "PATCH",
        body,
        requiresAuth: true,
        responseKey: "message",
      }),
    onSuccess: (data) => {
      if (data.UID) {
        queryClient.setQueryData(queryKeys.profile(data.UID), data);
      }
    },
  });
}

export function useDeleteProfileMutation() {
  return useMutation({
    mutationFn: async (profileUid: string) =>
      api.request<{ message: string }>("profile/delete", {
        method: "DELETE",
        query: { profileUID: profileUid },
        requiresAuth: true,
        responseKey: null,
      }),
  });
}

export function useSwitchMLSMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      profileUid,
      mlsType,
    }: {
      profileUid: string;
      mlsType: string;
    }) =>
      api.request<{ token: string; message: Profile }>("auth/mlsSwitch", {
        method: "PATCH",
        body: { profileUID: profileUid, mlsType },
        requiresAuth: true,
        responseKey: null,
      }),
    onSuccess: (data, { profileUid }) => {
      const newUid = data.message.UID;
      // Remove stale queries keyed by old UID
      queryClient.removeQueries({ queryKey: queryKeys.profile(profileUid) });
      queryClient.removeQueries({ queryKey: queryKeys.feed(profileUid) });
      // Invalidate new UID queries so they refetch
      if (newUid && newUid !== profileUid) {
        queryClient.invalidateQueries({ queryKey: queryKeys.profile(newUid) });
        queryClient.invalidateQueries({ queryKey: queryKeys.feed(newUid) });
      }
    },
  });
}

export function useTrackProfileView() {
  return useMutation({
    mutationFn: async ({
      profileUid,
      viewedProfileUid,
    }: {
      profileUid: string;
      viewedProfileUid: string;
    }) =>
      api.request<{ message: string }>("views", {
        method: "POST",
        query: { profileUID: profileUid, viewedProfileUID: viewedProfileUid },
        responseKey: null,
      }),
  });
}
