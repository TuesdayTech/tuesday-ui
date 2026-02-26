import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "phosphor-react-native";
import { useRouter } from "expo-router";
import { useThemeColors } from "../../hooks/useThemeColors";
import { useSearchContext } from "../../providers/search-provider";
import { DEFAULT_STATUSES, STATUS_EMOJI } from "../../lib/search/constants";
import {
  formatPricePill,
  formatBedsPill,
  formatBathsPill,
  formatSqftPill,
  formatLotPill,
  formatYearPill,
} from "../../lib/search/filters";

export function FilterPills() {
  const t = useThemeColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state, dispatch, activeFiltersCount } = useSearchContext();

  if (activeFiltersCount === 0) return null;

  // Search bar is 46px normally, 88px when location pills are shown
  const hasLocations =
    state.selectedLocations.length > 0 ||
    state.customBoundaryPoints.length > 0;
  const searchBarBottom = insets.top + 8 + (hasLocations ? 88 : 46);
  const pillsTop = searchBarBottom + 8;

  const pills: Array<{ label: string; key: string; onRemove: () => void }> =
    [];
  const f = state.filters;

  // Property types
  const pts = f.propertyTypesWithSubTypes ?? [];
  const isDefaultPT =
    pts.length === 1 && pts[0].type === "RESI" && pts[0].values.length === 0;
  if (!isDefaultPT && pts.length > 0) {
    pts.forEach((pt) => {
      const label =
        pt.values.length > 0
          ? `${pt.type} (${pt.values.length})`
          : pt.type;
      pills.push({
        label,
        key: `pt-${pt.type}`,
        onRemove: () => {
          const next = pts.filter((p) => p.type !== pt.type);
          dispatch({
            type: "MERGE_FILTERS",
            partial: {
              propertyTypesWithSubTypes: next.length > 0 ? next : undefined,
            },
          });
        },
      });
    });
  }

  // Price
  const priceLabel = formatPricePill(f.minPrice, f.maxPrice);
  if (priceLabel) {
    pills.push({
      label: priceLabel,
      key: "price",
      onRemove: () =>
        dispatch({
          type: "MERGE_FILTERS",
          partial: { minPrice: undefined, maxPrice: undefined },
        }),
    });
  }

  // Status
  const isDefaultStatus =
    f.standardStatus &&
    f.standardStatus.length === DEFAULT_STATUSES.length &&
    DEFAULT_STATUSES.every((s) => f.standardStatus!.includes(s));
  if (!isDefaultStatus && f.standardStatus?.length) {
    const first = f.standardStatus[0];
    const emoji = STATUS_EMOJI[first] ?? "";
    const extra = f.standardStatus.length > 1 ? `+${f.standardStatus.length - 1}` : "";
    pills.push({
      label: `${emoji} ${first}${extra}`,
      key: "status",
      onRemove: () =>
        dispatch({
          type: "MERGE_FILTERS",
          partial: { standardStatus: [...DEFAULT_STATUSES] },
        }),
    });
  }

  // Beds
  const bedsLabel = formatBedsPill(f.minBedrooms, f.maxBedrooms);
  if (bedsLabel) {
    pills.push({
      label: bedsLabel,
      key: "beds",
      onRemove: () =>
        dispatch({
          type: "MERGE_FILTERS",
          partial: { minBedrooms: undefined, maxBedrooms: undefined },
        }),
    });
  }

  // Baths
  const bathsLabel = formatBathsPill(f.minBathrooms, f.maxBathrooms);
  if (bathsLabel) {
    pills.push({
      label: bathsLabel,
      key: "baths",
      onRemove: () =>
        dispatch({
          type: "MERGE_FILTERS",
          partial: { minBathrooms: undefined, maxBathrooms: undefined },
        }),
    });
  }

  // Living area
  const sqftLabel = formatSqftPill(f.minLivingArea, f.maxLivingArea);
  if (sqftLabel) {
    pills.push({
      label: sqftLabel,
      key: "sqft",
      onRemove: () =>
        dispatch({
          type: "MERGE_FILTERS",
          partial: { minLivingArea: undefined, maxLivingArea: undefined },
        }),
    });
  }

  // Lot size
  const lotLabel = formatLotPill(f.minLotSizeAcres, f.maxLotSizeAcres);
  if (lotLabel) {
    pills.push({
      label: lotLabel,
      key: "lot",
      onRemove: () =>
        dispatch({
          type: "MERGE_FILTERS",
          partial: {
            minLotSizeAcres: undefined,
            maxLotSizeAcres: undefined,
          },
        }),
    });
  }

  // Year built
  const yearLabel = formatYearPill(f.minYearBuilt, f.maxYearBuilt);
  if (yearLabel) {
    pills.push({
      label: yearLabel,
      key: "year",
      onRemove: () =>
        dispatch({
          type: "MERGE_FILTERS",
          partial: { minYearBuilt: undefined, maxYearBuilt: undefined },
        }),
    });
  }

  // Single level
  if (f.levels?.includes("One")) {
    pills.push({
      label: "Single level",
      key: "levels",
      onRemove: () =>
        dispatch({ type: "MERGE_FILTERS", partial: { levels: undefined } }),
    });
  }

  if (pills.length === 0) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: pillsTop,
        left: 16,
        right: 16,
        zIndex: 9,
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 6 }}
      >
        {pills.map((pill) => (
          <View
            key={pill.key}
            style={{
              height: 36,
              borderRadius: 18,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 12,
              gap: 6,
              backgroundColor: t.background,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Pressable onPress={() => router.push("/search/filters")}>
              <Text
                style={{
                  color: "#0A84FF",
                  fontFamily: "GeistSans-Medium",
                  fontSize: 14,
                }}
              >
                {pill.label}
              </Text>
            </Pressable>
            <Pressable onPress={pill.onRemove} hitSlop={6}>
              <X size={14} color="#0A84FF" weight="bold" />
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
