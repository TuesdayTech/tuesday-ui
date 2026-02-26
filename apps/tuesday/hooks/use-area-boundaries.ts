import { useQuery, useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { api } from "../lib/api/client";
import { queryKeys } from "./query-keys";
import type { AreaBoundaries } from "../types/search";

/**
 * Fetch geographic boundary polygons for a selected area (city or ZIP).
 * Boundaries arrive as GeoJSON MultiPolygon: [polygon][ring][point as [lng, lat]].
 */
export function useAreaBoundaries(areaUID: string | null) {
  return useQuery({
    queryKey: queryKeys.areaBoundaries(areaUID ?? ""),
    queryFn: async () => {
      const raw = await api.request<AreaBoundaries>(
        "search/v2/areaBoundaries",
        {
          method: "GET",
          query: { areaUID: areaUID! },
          requiresAuth: true,
          responseKey: null,
        },
      );
      return raw;
    },
    enabled: !!areaUID,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch boundaries for ALL selected locations at once.
 * Returns a flat array of LatLng polygon arrays ready for react-native-maps.
 */
export function useAllAreaBoundaries(uids: string[]) {
  const results = useQueries({
    queries: uids.map((uid) => ({
      queryKey: queryKeys.areaBoundaries(uid),
      queryFn: () =>
        api.request<AreaBoundaries>("search/v2/areaBoundaries", {
          method: "GET",
          query: { areaUID: uid },
          requiresAuth: true,
          responseKey: null,
        }),
      enabled: !!uid,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const allBoundaries = useMemo(() => {
    const polygons: Array<{ latitude: number; longitude: number }[]> = [];
    for (const result of results) {
      if (result.data?.boundaries) {
        polygons.push(...boundariesToLatLng(result.data.boundaries));
      }
    }
    return polygons;
  }, [results]);

  return allBoundaries;
}

/**
 * Convert raw GeoJSON MultiPolygon boundaries to react-native-maps LatLng arrays.
 *
 * Structure: boundaries[polygon][ring][point] where point = [lng, lat]
 * We flatten polygons+rings into a flat list of coordinate arrays.
 */
export function boundariesToLatLng(
  boundaries: number[][][][] | undefined,
): Array<{ latitude: number; longitude: number }[]> {
  if (!boundaries) return [];

  const result: Array<{ latitude: number; longitude: number }[]> = [];

  for (const polygon of boundaries) {
    for (const ring of polygon) {
      const coords = ring
        .filter(
          (point) =>
            Array.isArray(point) &&
            point.length >= 2 &&
            typeof point[0] === "number" &&
            typeof point[1] === "number",
        )
        .map(([lng, lat]) => ({ latitude: lat, longitude: lng }));

      if (coords.length >= 3) {
        result.push(coords);
      }
    }
  }

  return result;
}
