import type { SearchFilters } from "../../types/search";

export const MAP_PAGINATION_LIMIT = 120;

export const DEFAULT_STATUSES = [
  "Active",
  "Pending",
  "ActiveUnderContract",
  "ComingSoon",
];

export const CLOSED_STATUSES = ["Closed"];

export const ALL_STATUSES = [
  "Active",
  "ComingSoon",
  "Pending",
  "ActiveUnderContract",
  "Closed",
  "Withdrawn",
  "Hold",
  "Canceled",
  "Expired",
];

export const STATUS_EMOJI: Record<string, string> = {
  Active: "\u{1F7E2}",
  ComingSoon: "\u{1F535}",
  Pending: "\u{1F7E1}",
  ActiveUnderContract: "\u{1F7E0}",
  Closed: "\u{26AB}",
  Withdrawn: "\u{1F534}",
  Hold: "\u{1F7E3}",
  Canceled: "\u{274C}",
  Expired: "\u{23F0}",
};

export const STATUS_COLORS: Record<string, string> = {
  Active: "#2EA043",
  ComingSoon: "#0A84FF",
  Pending: "#F5A623",
  ActiveUnderContract: "#FF9500",
  Closed: "#333333",
  Withdrawn: "#E5484D",
  Hold: "#8B5CF6",
  Canceled: "#E5484D",
  Expired: "#E5484D",
};

/** MLS-based initial map coordinates */
export const MLS_COORDINATES: Record<
  string,
  { lat: number; lng: number; latDelta: number; lngDelta: number }
> = {
  crmls: { lat: 34.0549, lng: -118.2426, latDelta: 0.1, lngDelta: 0.1 },
  northstar: { lat: 44.9778, lng: -93.265, latDelta: 0.1, lngDelta: 0.1 },
  real: { lat: 30.33694, lng: -81.66139, latDelta: 0.1, lngDelta: 0.1 },
  mibor: { lat: 39.789161, lng: -86.154628, latDelta: 0.1, lngDelta: 0.1 },
  admin: { lat: 34.0549, lng: -118.2426, latDelta: 0.1, lngDelta: 0.1 },
  guest: { lat: 34.0549, lng: -118.2426, latDelta: 0.1, lngDelta: 0.1 },
};

export const DEFAULT_REGION = {
  latitude: 34.0549,
  longitude: -118.2426,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

/** Build a 6-month-ago ISO date string for the fromDate filter */
function getDateFilter6Months(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return d.toISOString();
}

/** Derive MLS type from profile UID prefix */
export function getMlsType(uid?: string): string {
  if (!uid) return "guest";
  const prefix = uid.substring(0, 5);
  if (prefix === "10340" || prefix === "20340") return "northstar";
  if (prefix === "10141" || prefix === "20141") return "real";
  if (prefix === "10093" || prefix === "20093") return "crmls";
  if (prefix === "10255" || prefix === "20255") return "mibor";
  if (prefix === "10000" || prefix === "20000") return "admin";
  return "guest";
}

/** Pin config per listing status — colors from SwiftUI Colors.xcassets + ListingStatus.swift */
export interface PinConfig {
  bg: { light: string; dark: string };
  text: { light: string; dark: string };
  emoji: string;
}

export const STATUS_PIN_CONFIG: Record<string, PinConfig> = {
  Active: {
    bg: { light: "#00A870", dark: "#00D68F" },
    text: { light: "#FFFFFF", dark: "#FFFFFF" },
    emoji: "🏡",
  },
  ComingSoon: {
    bg: { light: "#00A870", dark: "#00D68F" },
    text: { light: "#FFFFFF", dark: "#FFFFFF" },
    emoji: "⏱️",
  },
  Pending: {
    bg: { light: "#F58B06", dark: "#FFA300" },
    text: { light: "#FFFFFF", dark: "#FFFFFF" },
    emoji: "⏳",
  },
  ActiveUnderContract: {
    bg: { light: "#F58B06", dark: "#FFA300" },
    text: { light: "#FFFFFF", dark: "#FFFFFF" },
    emoji: "🤞",
  },
  Closed: {
    bg: { light: "#000000", dark: "#000000" },
    text: { light: "#FFFFFF", dark: "#FFFFFF" },
    emoji: "🔑",
  },
  Expired: {
    bg: { light: "#E5E5EA", dark: "#E5E5EA" },
    text: { light: "#EE0000", dark: "#FF3333" },
    emoji: "☠️",
  },
  Canceled: {
    bg: { light: "#E5E5EA", dark: "#E5E5EA" },
    text: { light: "#EE0000", dark: "#FF3333" },
    emoji: "🚫",
  },
  Hold: {
    bg: { light: "#E5E5EA", dark: "#E5E5EA" },
    text: { light: "#EE0000", dark: "#FF3333" },
    emoji: "✋",
  },
  Withdrawn: {
    bg: { light: "#E5E5EA", dark: "#E5E5EA" },
    text: { light: "#EE0000", dark: "#FF3333" },
    emoji: "🪝",
  },
};

const DEFAULT_PIN_CONFIG: PinConfig = {
  bg: { light: "#000000", dark: "#000000" },
  text: { light: "#FFFFFF", dark: "#FFFFFF" },
  emoji: "❓",
};

/** Brighten a hex color by +0.25 per channel (capped at 1.0), return with given opacity */
export function brightenColor(hex: string, opacity: number): string {
  const r = Math.min(parseInt(hex.slice(1, 3), 16) + 64, 255);
  const g = Math.min(parseInt(hex.slice(3, 5), 16) + 64, 255);
  const b = Math.min(parseInt(hex.slice(5, 7), 16) + 64, 255);
  return `rgba(${r},${g},${b},${opacity})`;
}

export function getPinConfig(status?: string): PinConfig {
  return STATUS_PIN_CONFIG[status ?? ""] ?? DEFAULT_PIN_CONFIG;
}

export function getDefaultFilters(): SearchFilters {
  return {
    propertyTypesWithSubTypes: [
      { type: "RESI", values: [] }, // empty values = all subtypes
    ],
    standardStatus: [...DEFAULT_STATUSES],
    fromDate: getDateFilter6Months(),
  };
}
