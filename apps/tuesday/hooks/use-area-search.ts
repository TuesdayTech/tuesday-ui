import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api/client";
import { queryKeys } from "./query-keys";
import type { AreaSearchResponse } from "../types/search";

/**
 * Area (city / ZIP) autocomplete search.
 * Only fires when searchText has 2+ chars.
 */
export function useAreaSearch(searchText: string) {
  return useQuery({
    queryKey: queryKeys.searchArea(searchText),
    queryFn: () =>
      api.request<AreaSearchResponse>("search/v2/area", {
        method: "GET",
        query: { searchValue: searchText, limit: 7, offset: 0 },
        requiresAuth: true,
        responseKey: null,
      }),
    enabled: searchText.trim().length >= 2,
    staleTime: 30_000,
  });
}
