import React, { createContext, useContext, useReducer, useMemo } from "react";
import type { Listing } from "../types/listing";
import type {
  SearchFilters,
  MapBounds,
  Coordinate,
  LocationFilter,
  AreaType,
  SearchViewMode,
  FiltersSearchResponse,
} from "../types/search";
import { getDefaultFilters } from "../lib/search/constants";
import { countActiveFilters } from "../lib/search/filters";

// ── State ───────────────────────────────────────────────────────────

export interface SearchState {
  // Map
  mapBounds: MapBounds | null;

  // Filters
  filters: SearchFilters;
  selectedLocations: LocationFilter[];
  customBoundaryPoints: Coordinate[];

  // UI mode
  viewMode: SearchViewMode;
  isSearchFocused: boolean;

  // Server filter options
  serverFilters: FiltersSearchResponse | null;

  // Results
  listings: Listing[];
  totalCount: string | null;
  isLoading: boolean;

  // Search overlay
  searchText: string;
}

function getInitialState(): SearchState {
  return {
    mapBounds: null,
    filters: getDefaultFilters(),
    selectedLocations: [],
    customBoundaryPoints: [],
    viewMode: "map",
    isSearchFocused: false,
    serverFilters: null,
    listings: [],
    totalCount: null,
    isLoading: false,
    searchText: "",
  };
}

// ── Actions ─────────────────────────────────────────────────────────

type SearchAction =
  | { type: "SET_MAP_BOUNDS"; bounds: MapBounds }
  | { type: "SET_FILTERS"; filters: SearchFilters }
  | { type: "MERGE_FILTERS"; partial: Partial<SearchFilters> }
  | { type: "RESET_FILTERS" }
  | { type: "ADD_LOCATION"; location: LocationFilter }
  | { type: "REMOVE_LOCATION"; uid: string }
  | { type: "SET_CUSTOM_BOUNDARY"; points: Coordinate[] }
  | { type: "SET_VIEW_MODE"; mode: SearchViewMode }
  | { type: "SET_SEARCH_FOCUSED"; focused: boolean }
  | { type: "SET_SEARCH_TEXT"; text: string }
  | { type: "SET_SERVER_FILTERS"; filters: FiltersSearchResponse }
  | { type: "SET_LISTINGS"; listings: Listing[]; totalCount: string | null }
  | { type: "SET_LOADING"; loading: boolean };

function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case "SET_MAP_BOUNDS":
      return { ...state, mapBounds: action.bounds };

    case "SET_FILTERS":
      return { ...state, filters: action.filters };

    case "MERGE_FILTERS":
      return { ...state, filters: { ...state.filters, ...action.partial } };

    case "RESET_FILTERS":
      return {
        ...state,
        filters: getDefaultFilters(),
        selectedLocations: [],
        customBoundaryPoints: [],
      };

    case "ADD_LOCATION": {
      const exists = state.selectedLocations.some(
        (l) => l.uid === action.location.uid,
      );
      if (exists) return state;
      return {
        ...state,
        selectedLocations: [...state.selectedLocations, action.location],
      };
    }

    case "REMOVE_LOCATION":
      return {
        ...state,
        selectedLocations: state.selectedLocations.filter(
          (l) => l.uid !== action.uid,
        ),
      };

    case "SET_CUSTOM_BOUNDARY":
      return { ...state, customBoundaryPoints: action.points };

    case "SET_VIEW_MODE":
      return { ...state, viewMode: action.mode };

    case "SET_SEARCH_FOCUSED":
      return {
        ...state,
        isSearchFocused: action.focused,
        ...(action.focused ? {} : { searchText: "" }),
      };

    case "SET_SEARCH_TEXT":
      return { ...state, searchText: action.text };

    case "SET_SERVER_FILTERS":
      return { ...state, serverFilters: action.filters };

    case "SET_LISTINGS":
      return {
        ...state,
        listings: action.listings,
        totalCount: action.totalCount,
      };

    case "SET_LOADING":
      return { ...state, isLoading: action.loading };

    default:
      return state;
  }
}

// ── Context ─────────────────────────────────────────────────────────

interface SearchContextValue {
  state: SearchState;
  dispatch: React.Dispatch<SearchAction>;
  /** City UIDs extracted from selectedLocations */
  cityUIDs: string[];
  /** Postal code UIDs extracted from selectedLocations */
  postalCodeUIDs: string[];
  /** Number of non-default active filters */
  activeFiltersCount: number;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(searchReducer, undefined, getInitialState);

  const cityUIDs = useMemo(
    () =>
      state.selectedLocations
        .filter((l) => l.type === "city")
        .map((l) => l.uid),
    [state.selectedLocations],
  );

  const postalCodeUIDs = useMemo(
    () =>
      state.selectedLocations
        .filter((l) => l.type === "zip")
        .map((l) => l.uid),
    [state.selectedLocations],
  );

  const activeFiltersCount = useMemo(
    () => countActiveFilters(state.filters),
    [state.filters],
  );

  const value = useMemo<SearchContextValue>(
    () => ({
      state,
      dispatch,
      cityUIDs,
      postalCodeUIDs,
      activeFiltersCount,
    }),
    [state, dispatch, cityUIDs, postalCodeUIDs, activeFiltersCount],
  );

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
}

export function useSearchContext(): SearchContextValue {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearchContext must be used within SearchProvider");
  return ctx;
}
