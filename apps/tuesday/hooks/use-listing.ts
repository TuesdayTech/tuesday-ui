import { useQuery } from "@tanstack/react-query";
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
