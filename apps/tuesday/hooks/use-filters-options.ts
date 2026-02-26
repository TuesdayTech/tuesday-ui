import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api/client";
import { queryKeys } from "./query-keys";
import type { FiltersSearchResponse } from "../types/search";

/**
 * Fetch available filter options (property types, statuses, levels) for a given MLS.
 * Rarely changes — cached with long staleTime.
 */
export function useFiltersOptions(mlsType: string) {
  return useQuery({
    queryKey: queryKeys.filtersOptions(mlsType),
    queryFn: () =>
      api.request<FiltersSearchResponse>("search/filters", {
        method: "GET",
        query: { mlsType },
        requiresAuth: true,
        responseKey: null,
      }),
    enabled: !!mlsType,
    staleTime: Infinity,
  });
}
