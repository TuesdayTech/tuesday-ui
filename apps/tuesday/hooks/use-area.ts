import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api/client";
import { FEED_PAGE_SIZE } from "../lib/api/constants";
import { queryKeys } from "./query-keys";
import type { Area } from "../types/area";
import type { Listing } from "../types/listing";
import type { ProfileSortOrder } from "../types/profile";

export function useArea(uid: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.area(uid),
    queryFn: () =>
      api.request<Area>("profile/area", {
        query: { areaUID: uid },
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

export function useAreaListings(
  areaUid: string,
  profileUid: string,
  sort: ProfileSortOrder = "recent",
  enabled = true,
) {
  return useInfiniteQuery({
    queryKey: queryKeys.areaListings(areaUid, sort),
    queryFn: async ({ pageParam = 0 }) => {
      const listings = await api.request<Listing[]>(
        "profile/area/listings/updated",
        {
          method: "POST",
          body: {
            areaUID: areaUid,
            profileUID: profileUid,
            limit: FEED_PAGE_SIZE,
            offset: pageParam,
            filters: { orderFilter: SORT_API_VALUE[sort] },
          },
          requiresAuth: true,
          responseKey: null,
        },
      );

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
    enabled: enabled && !!areaUid,
  });
}

export function useAreaFollowMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      profileUid,
      areaUid,
      follow,
    }: {
      profileUid: string;
      areaUid: string;
      follow: boolean;
    }) =>
      api.request<string>(follow ? "follow" : "unfollow", {
        method: "POST",
        body: {
          profileUID: profileUid,
          areas: [{ UID: areaUid }],
        },
        responseKey: "message",
      }),

    // Optimistic: update cache immediately so UI doesn't flicker
    onMutate: async ({ areaUid, follow }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.area(areaUid) });
      const previous = queryClient.getQueryData<Area>(queryKeys.area(areaUid));
      queryClient.setQueryData<Area>(queryKeys.area(areaUid), (old) =>
        old ? { ...old, isFollowing: follow } : old,
      );
      return { previous };
    },

    // Revert cache on error
    onError: (_err, { areaUid }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.area(areaUid), context.previous);
      }
    },

    // Sync with server after mutation settles
    onSettled: (_data, _error, { profileUid, areaUid }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.area(areaUid),
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.followings(profileUid),
      });
    },
  });
}
