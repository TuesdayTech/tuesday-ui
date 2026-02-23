import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api/client";
import { queryKeys } from "./query-keys";
import type { Listing } from "../types/listing";

export function useListing(listingUid: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.listing(listingUid),
    queryFn: () =>
      api.request<Listing>("listing/byID", {
        query: { listingUID: listingUid },
        responseKey: "message",
      }),
    enabled: enabled && !!listingUid,
  });
}

export function useLikeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      profileUid,
      listingUid,
      isLike,
    }: {
      profileUid: string;
      listingUid: string;
      isLike: boolean;
    }) =>
      api.request<string>("likes", {
        query: {
          profileUID: profileUid,
          listingUID: listingUid,
          like: isLike,
        },
        responseKey: "message",
      }),

    onSettled: (_data, _error, { profileUid }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feed(profileUid) });
    },
  });
}
