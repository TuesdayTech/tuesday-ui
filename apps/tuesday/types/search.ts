import type { Listing } from "./listing";

// --- Filter types ---

export interface TypeWithValues {
  type: string;
  values: string[];
}

export interface SearchFilters {
  propertyTypesWithSubTypes?: TypeWithValues[];
  minPrice?: number;
  maxPrice?: number;
  standardStatus?: string[];
  fromDate?: string;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  minLivingArea?: number;
  maxLivingArea?: number;
  minLotSizeAcres?: number;
  maxLotSizeAcres?: number;
  minYearBuilt?: number;
  maxYearBuilt?: number;
  levels?: string[];
}

// --- Map types ---

export interface MapBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface Coordinate {
  lat: number;
  lng: number;
}

// --- API response types ---

export interface MapSearchResult {
  listings: Listing[] | null;
  bounds: {
    upperLeft?: { lat?: string; lng?: string };
    lowerRight?: { lat?: string; lng?: string };
  } | null;
  totalCount?: string;
}

export interface SearchAreaResult {
  UID: string;
  FullName?: string;
  Media?: string;
  Bio?: string;
  OfficeName?: string;
  IsVerified?: boolean;
}

export interface AreaSearchResponse {
  areas: SearchAreaResult[];
  totalAreas?: number;
}

export interface AreaBoundaries {
  UID: string;
  AreaName?: string;
  AreaState?: string;
  AreaType?: string;
  boundaries?: number[][][][]; // GeoJSON MultiPolygon: [polygon][ring][point][lng,lat]
  FakeBoundary?: boolean;
}

// --- Server-provided filter options ---

export interface FiltersSearchType {
  type?: string;
  title?: string;
  values?: (string | null)[];
}

export interface FiltersSearchResponse {
  propertyTypes?: FiltersSearchType[];
  standardStatuses?: (string | null)[];
  levels?: (string | null)[];
}

// --- Location filter ---

export type AreaType = "city" | "zip";

export interface LocationFilter {
  uid: string;
  name: string;
  type: AreaType;
}

// --- View mode ---

export type SearchViewMode = "map" | "grid";

// --- Recent search ---

export interface RecentSearch {
  uid: string;
  name: string;
  subtitle?: string;
  type: AreaType | "address";
  timestamp: number;
}
