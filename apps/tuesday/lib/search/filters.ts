import type {
  SearchFilters,
  Coordinate,
  MapBounds,
} from "../../types/search";
import { DEFAULT_STATUSES } from "./constants";

/** Build the filters object for the POST search/v2/box request body */
export function buildSearchBody(
  profileUID: string,
  bounds: MapBounds,
  filters: SearchFilters,
  cityUIDs: string[],
  postalCodeUIDs: string[],
  points: Coordinate[],
  limit: number,
  offset: number,
) {
  return {
    profileUID,
    minLat: bounds.minLat,
    maxLat: bounds.maxLat,
    minLng: bounds.minLng,
    maxLng: bounds.maxLng,
    cityUID: cityUIDs,
    postalCodeUID: postalCodeUIDs,
    points: points.map((p) => ({ lat: p.lat, lng: p.lng })),
    limit,
    offset,
    filters: buildFiltersBody(filters),
  };
}

/** Serialize SearchFilters to the API wire format */
export function buildFiltersBody(filters: SearchFilters) {
  const body: Record<string, unknown> = {};

  if (filters.propertyTypesWithSubTypes?.length) {
    body.propertyTypesWithSubTypes = filters.propertyTypesWithSubTypes;
  }
  if (filters.minPrice != null) body.minPrice = filters.minPrice;
  if (filters.maxPrice != null) body.maxPrice = filters.maxPrice;
  if (filters.standardStatus?.length) {
    body.standardStatus = filters.standardStatus;
  }
  if (filters.fromDate) body.fromDate = filters.fromDate;
  if (filters.minBedrooms != null) body.minBedrooms = filters.minBedrooms;
  if (filters.maxBedrooms != null) body.maxBedrooms = filters.maxBedrooms;
  if (filters.minBathrooms != null) body.minBathrooms = filters.minBathrooms;
  if (filters.maxBathrooms != null) body.maxBathrooms = filters.maxBathrooms;
  if (filters.minLivingArea != null) body.minLivingArea = filters.minLivingArea;
  if (filters.maxLivingArea != null) body.maxLivingArea = filters.maxLivingArea;
  if (filters.minLotSizeAcres != null)
    body.minLotSizeAcres = filters.minLotSizeAcres;
  if (filters.maxLotSizeAcres != null)
    body.maxLotSizeAcres = filters.maxLotSizeAcres;
  if (filters.minYearBuilt != null) body.minYearBuilt = filters.minYearBuilt;
  if (filters.maxYearBuilt != null) body.maxYearBuilt = filters.maxYearBuilt;
  if (filters.levels?.length) body.levels = filters.levels;

  return body;
}

/** Count non-default active filters for badge display */
export function countActiveFilters(filters: SearchFilters): number {
  let count = 0;

  if (filters.minPrice != null || filters.maxPrice != null) count++;

  const isDefaultStatus =
    filters.standardStatus &&
    filters.standardStatus.length === DEFAULT_STATUSES.length &&
    DEFAULT_STATUSES.every((s) => filters.standardStatus!.includes(s));
  if (!isDefaultStatus && filters.standardStatus?.length) count++;

  if (filters.minBedrooms != null || filters.maxBedrooms != null) count++;
  if (filters.minBathrooms != null || filters.maxBathrooms != null) count++;
  if (filters.minLivingArea != null || filters.maxLivingArea != null) count++;
  if (filters.minLotSizeAcres != null || filters.maxLotSizeAcres != null)
    count++;
  if (filters.minYearBuilt != null || filters.maxYearBuilt != null) count++;
  if (filters.levels?.length) count++;

  // Count each non-default property type
  const pts = filters.propertyTypesWithSubTypes ?? [];
  const isDefaultPT =
    pts.length === 1 && pts[0].type === "RESI" && pts[0].values.length === 0;
  if (!isDefaultPT && pts.length > 0) count++;

  return count;
}

// --- Pill display formatters ---

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 0)}K`;
  return String(n);
}

export function formatPricePill(min?: number, max?: number): string | null {
  if (min != null && max != null) return `$${formatCompact(min)}-$${formatCompact(max)}`;
  if (min != null) return `$${formatCompact(min)}+`;
  if (max != null) return `< $${formatCompact(max)}`;
  return null;
}

export function formatBedsPill(min?: number, max?: number): string | null {
  if (min != null && max != null) return `${min}-${max} beds`;
  if (min != null) return `${min}+ beds`;
  if (max != null) return `max ${max} beds`;
  return null;
}

export function formatBathsPill(min?: number, max?: number): string | null {
  if (min != null && max != null) return `${min}-${max} baths`;
  if (min != null) return `${min}+ baths`;
  if (max != null) return `max ${max} baths`;
  return null;
}

export function formatSqftPill(min?: number, max?: number): string | null {
  const fmtK = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : String(n));
  if (min != null && max != null) return `${fmtK(min)}-${fmtK(max)} sqft`;
  if (min != null) return `${fmtK(min)}+ sqft`;
  if (max != null) return `< ${fmtK(max)} sqft`;
  return null;
}

export function formatLotPill(min?: number, max?: number): string | null {
  if (min != null && max != null) return `${min}-${max} acres`;
  if (min != null) return `${min}+ acres`;
  if (max != null) return `< ${max} acres`;
  return null;
}

export function formatYearPill(min?: number, max?: number): string | null {
  if (min != null && max != null) return `${min}-${max} year`;
  if (min != null) return `${min}+ year`;
  if (max != null) return `max ${max} year`;
  return null;
}
