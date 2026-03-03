import { useRef, useCallback } from "react";
import { api } from "../lib/api/client";
import { ApiError } from "../lib/api/errors";
import { buildSearchBody } from "../lib/search/filters";
import { MAP_PAGINATION_LIMIT } from "../lib/search/constants";
import { useSearchContext } from "../providers/search-provider";
import { useAuth } from "../providers/auth-provider";
import type { MapSearchResult, MapBounds } from "../types/search";

/** Check if an error is a deliberate cancellation (not a real failure). */
function isCancellation(err: unknown): boolean {
  if (err instanceof ApiError && err.code === "aborted") return true;
  if ((err as Error).name === "AbortError") return true;
  return false;
}

/**
 * Imperative hook for map-based listing search.
 * Debounces 500ms, cancels in-flight requests on new calls.
 */
export function useMapSearch() {
  const { state, dispatch, cityUIDs, postalCodeUIDs } = useSearchContext();
  const { profile } = useAuth();
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchByBox = useCallback(
    (bounds: MapBounds) => {
      // Cancel previous debounce timer
      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(async () => {
        // Cancel in-flight request
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        const profileUID = profile?.UID ?? "";

        dispatch({ type: "SET_LOADING", loading: true });

        try {
          const body = buildSearchBody(
            profileUID,
            bounds,
            state.filters,
            cityUIDs,
            postalCodeUIDs,
            state.customBoundaryPoints,
            MAP_PAGINATION_LIMIT,
            0,
          );

          const result = await api.request<MapSearchResult>("search/v2/box", {
            method: "POST",
            body: body as unknown as Record<string, unknown>,
            requiresAuth: true,
            signal: controller.signal,
            responseKey: null,
          });

          if (!controller.signal.aborted) {
            dispatch({
              type: "SET_LISTINGS",
              listings: result.listings ?? [],
              totalCount: result.totalCount ?? null,
            });
          }
        } catch (err) {
          if (!isCancellation(err)) {
            if (__DEV__) console.warn("[useMapSearch] error:", err);
          }
        } finally {
          if (!controller.signal.aborted) {
            dispatch({ type: "SET_LOADING", loading: false });
          }
        }
      }, 500);
    },
    [
      state.filters,
      state.customBoundaryPoints,
      cityUIDs,
      postalCodeUIDs,
      profile?.UID,
      dispatch,
    ],
  );

  /** Force an immediate search (no debounce) */
  const searchImmediate = useCallback(
    async (bounds: MapBounds) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const profileUID = profile?.UID ?? "";

      dispatch({ type: "SET_LOADING", loading: true });

      try {
        const body = buildSearchBody(
          profileUID,
          bounds,
          state.filters,
          cityUIDs,
          postalCodeUIDs,
          state.customBoundaryPoints,
          MAP_PAGINATION_LIMIT,
          0,
        );

        const result = await api.request<MapSearchResult>("search/v2/box", {
          method: "POST",
          body: body as unknown as Record<string, unknown>,
          requiresAuth: true,
          signal: controller.signal,
          responseKey: null,
        });

        if (!controller.signal.aborted) {
          dispatch({
            type: "SET_LISTINGS",
            listings: result.listings ?? [],
            totalCount: result.totalCount ?? null,
          });
        }
      } catch (err) {
        if (!isCancellation(err)) {
          if (__DEV__) console.warn("[useMapSearch] error:", err);
        }
      } finally {
        if (!controller.signal.aborted) {
          dispatch({ type: "SET_LOADING", loading: false });
        }
      }
    },
    [
      state.filters,
      state.customBoundaryPoints,
      cityUIDs,
      postalCodeUIDs,
      profile?.UID,
      dispatch,
    ],
  );

  return { searchByBox, searchImmediate };
}
