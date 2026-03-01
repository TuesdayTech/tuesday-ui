import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api/client";
import { queryKeys } from "./query-keys";
import type { Listing } from "../types/listing";

export function useListing(listingUid: string, profileUid: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.listing(listingUid),
    queryFn: () =>
      api.request<Listing>("listing/byID", {
        query: { listingUID: listingUid, profileUID: profileUid },
        responseKey: null,
      }),
    enabled: enabled && !!listingUid && !!profileUid,
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
