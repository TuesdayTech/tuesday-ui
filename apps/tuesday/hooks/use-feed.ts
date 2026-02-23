import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "../lib/api/client";
import { FEED_PAGE_SIZE } from "../lib/api/constants";
import { queryKeys } from "./query-keys";
import type { Listing } from "../types/listing";

interface UseFeedParams {
  profileUid: string;
  enabled?: boolean;
}

export function useInfiniteFeed({ profileUid, enabled = true }: UseFeedParams) {
  return useInfiniteQuery({
    queryKey: queryKeys.feed(profileUid),
    queryFn: async ({ pageParam = 0 }) => {
      const listings = await api.request<Listing[]>("listing/feed", {
        query: {
          profileUID: profileUid,
          limit: FEED_PAGE_SIZE,
          offset: pageParam,
        },
        responseKey: null, // API returns a bare array, no envelope
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
    enabled: enabled && !!profileUid,
    staleTime: 2 * 60 * 1000, // 2 min for feed
  });
}
