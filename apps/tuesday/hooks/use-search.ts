import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "../lib/api/client";
import { queryKeys } from "./query-keys";
import type { Listing } from "../types/listing";

interface UseSearchParams {
  query: string;
  filters?: Record<string, unknown>;
  profileUid: string;
  enabled?: boolean;
}

export function useInfiniteSearch({
  query,
  filters,
  profileUid,
  enabled = true,
}: UseSearchParams) {
  return useInfiniteQuery({
    queryKey: queryKeys.search(query, filters),
    queryFn: async ({ pageParam = 0 }) => {
      const listings = await api.request<Listing[]>("search/v2", {
        query: {
          profileUID: profileUid,
          q: query,
          limit: 20,
          offset: pageParam,
          ...((filters ?? {}) as Record<string, string>),
        },
        requiresAuth: true,
        responseKey: "message",
      });

      return {
        listings: listings ?? [],
        nextOffset:
          listings && listings.length === 20
            ? (pageParam as number) + 20
            : undefined,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    enabled: enabled && !!query && !!profileUid,
  });
}
