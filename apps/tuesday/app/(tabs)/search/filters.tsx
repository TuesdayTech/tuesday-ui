import React, { useCallback, useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { CaretLeft } from "phosphor-react-native";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { useSearchContext } from "../../../providers/search-provider";
import { useAuth } from "../../../providers/auth-provider";
import { useFiltersOptions } from "../../../hooks/use-filters-options";
import { getDefaultFilters, getMlsType } from "../../../lib/search/constants";
import { PriceRangeFilter } from "../../../components/search/filters/PriceRangeFilter";
import { BedsAndBathsFilter } from "../../../components/search/filters/BedsAndBathsFilter";
import { StatusFilter } from "../../../components/search/filters/StatusFilter";
import { PropertyTypeFilter } from "../../../components/search/filters/PropertyTypeFilter";
import { RangeInputRow } from "../../../components/search/filters/RangeInputRow";

export default function FiltersScreen() {
  const t = useThemeColors();
  const router = useRouter();
  const { profile } = useAuth();
  const { state, dispatch } = useSearchContext();
  const f = state.filters;

  const mlsType = getMlsType(profile?.UID);
  const { data: serverFilters } = useFiltersOptions(mlsType);

  // Local state for debounced text inputs
  const [minLiving, setMinLiving] = useState(
    f.minLivingArea != null ? String(f.minLivingArea) : "",
  );
  const [maxLiving, setMaxLiving] = useState(
    f.maxLivingArea != null ? String(f.maxLivingArea) : "",
  );
  const [minLot, setMinLot] = useState(
    f.minLotSizeAcres != null ? String(f.minLotSizeAcres) : "",
  );
  const [maxLot, setMaxLot] = useState(
    f.maxLotSizeAcres != null ? String(f.maxLotSizeAcres) : "",
  );
  const [minYear, setMinYear] = useState(
    f.minYearBuilt != null ? String(f.minYearBuilt) : "",
  );
  const [maxYear, setMaxYear] = useState(
    f.maxYearBuilt != null ? String(f.maxYearBuilt) : "",
  );

  // Debounce living area changes
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({
        type: "MERGE_FILTERS",
        partial: {
          minLivingArea: minLiving ? parseInt(minLiving, 10) : undefined,
          maxLivingArea: maxLiving ? parseInt(maxLiving, 10) : undefined,
        },
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [minLiving, maxLiving]);

  // Debounce lot size changes
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({
        type: "MERGE_FILTERS",
        partial: {
          minLotSizeAcres: minLot ? parseFloat(minLot) : undefined,
          maxLotSizeAcres: maxLot ? parseFloat(maxLot) : undefined,
        },
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [minLot, maxLot]);

  // Debounce year built changes
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({
        type: "MERGE_FILTERS",
        partial: {
          minYearBuilt: minYear ? parseInt(minYear, 10) : undefined,
          maxYearBuilt: maxYear ? parseInt(maxYear, 10) : undefined,
        },
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [minYear, maxYear]);

  const handleReset = useCallback(() => {
    dispatch({ type: "RESET_FILTERS" });
    setMinLiving("");
    setMaxLiving("");
    setMinLot("");
    setMaxLot("");
    setMinYear("");
    setMaxYear("");
  }, [dispatch]);

  const isSingleLevel = f.levels?.includes("One") ?? false;

  // Results text
  let resultsText = "View results";
  if (state.totalCount) {
    const total = parseInt(state.totalCount, 10);
    const shown = state.listings.length;
    if (total > shown) {
      resultsText = `View ${shown} of ${total > 1000 ? "1000+" : total} results`;
    } else {
      resultsText = `View ${shown} results`;
    }
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: t.background }}
      edges={["top"]}
    >
      {/* Header */}
      <View
        className="flex-row items-center"
        style={{
          height: 52,
          paddingHorizontal: 16,
          borderBottomWidth: 0.5,
          borderBottomColor: t.border,
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <CaretLeft size={22} color={t.foreground} weight="bold" />
        </Pressable>
        <Text
          style={{
            flex: 1,
            textAlign: "center",
            color: t.foreground,
            fontFamily: "GeistSans-SemiBold",
            fontSize: 17,
          }}
        >
          Filters
        </Text>
        <Pressable onPress={handleReset} hitSlop={8}>
          <Text
            style={{
              color: "#0A84FF",
              fontFamily: "GeistSans-Medium",
              fontSize: 15,
            }}
          >
            Reset
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 100,
            gap: 28,
            paddingTop: 20,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Locations */}
          {state.selectedLocations.length > 0 && (
            <View>
              <Text
                style={{
                  color: t.foreground,
                  fontFamily: "GeistSans-SemiBold",
                  fontSize: 15,
                  marginBottom: 10,
                }}
              >
                Locations
              </Text>
              <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                {state.selectedLocations.map((loc) => (
                  <View
                    key={loc.uid}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      height: 32,
                      paddingHorizontal: 12,
                      borderRadius: 16,
                      backgroundColor: "#0A84FF",
                      gap: 6,
                    }}
                  >
                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontFamily: "GeistSans-Medium",
                        fontSize: 13,
                      }}
                    >
                      {loc.name}
                    </Text>
                    <Pressable
                      onPress={() =>
                        dispatch({ type: "REMOVE_LOCATION", uid: loc.uid })
                      }
                      hitSlop={6}
                    >
                      <Text
                        style={{
                          color: "rgba(255,255,255,0.7)",
                          fontFamily: "GeistSans-Bold",
                          fontSize: 14,
                        }}
                      >
                        ×
                      </Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Status */}
          <StatusFilter
            selectedStatuses={f.standardStatus ?? []}
            onChange={(statuses) =>
              dispatch({
                type: "MERGE_FILTERS",
                partial: { standardStatus: statuses },
              })
            }
          />

          {/* Price */}
          <PriceRangeFilter
            minPrice={f.minPrice}
            maxPrice={f.maxPrice}
            onChange={(min, max) =>
              dispatch({
                type: "MERGE_FILTERS",
                partial: { minPrice: min, maxPrice: max },
              })
            }
          />

          {/* Bedrooms */}
          <BedsAndBathsFilter
            label="Bedrooms"
            minValue={f.minBedrooms}
            onChange={(min) =>
              dispatch({
                type: "MERGE_FILTERS",
                partial: { minBedrooms: min, maxBedrooms: undefined },
              })
            }
          />

          {/* Bathrooms */}
          <BedsAndBathsFilter
            label="Bathrooms"
            minValue={f.minBathrooms}
            onChange={(min) =>
              dispatch({
                type: "MERGE_FILTERS",
                partial: { minBathrooms: min, maxBathrooms: undefined },
              })
            }
          />

          {/* Living Area */}
          <View>
            <Text
              style={{
                color: t.foreground,
                fontFamily: "GeistSans-SemiBold",
                fontSize: 15,
                marginBottom: 10,
              }}
            >
              Living area (sqft)
            </Text>
            <RangeInputRow
              minValue={minLiving}
              maxValue={maxLiving}
              onMinChange={setMinLiving}
              onMaxChange={setMaxLiving}
              keyboardType="number-pad"
            />
          </View>

          {/* Lot Size */}
          <View>
            <Text
              style={{
                color: t.foreground,
                fontFamily: "GeistSans-SemiBold",
                fontSize: 15,
                marginBottom: 10,
              }}
            >
              Lot size (acres)
            </Text>
            <RangeInputRow
              minValue={minLot}
              maxValue={maxLot}
              onMinChange={setMinLot}
              onMaxChange={setMaxLot}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Year Built */}
          <View>
            <Text
              style={{
                color: t.foreground,
                fontFamily: "GeistSans-SemiBold",
                fontSize: 15,
                marginBottom: 10,
              }}
            >
              Year built
            </Text>
            <RangeInputRow
              minValue={minYear}
              maxValue={maxYear}
              onMinChange={setMinYear}
              onMaxChange={setMaxYear}
              keyboardType="number-pad"
            />
          </View>

          {/* Single Level */}
          <View
            className="flex-row items-center"
            style={{ justifyContent: "space-between" }}
          >
            <Text
              style={{
                color: t.foreground,
                fontFamily: "GeistSans-SemiBold",
                fontSize: 15,
              }}
            >
              Single level
            </Text>
            <Switch
              value={isSingleLevel}
              onValueChange={(val) =>
                dispatch({
                  type: "MERGE_FILTERS",
                  partial: { levels: val ? ["One"] : undefined },
                })
              }
              trackColor={{ true: "#0A84FF", false: t.backgroundTertiary }}
            />
          </View>

          {/* Property Types */}
          {serverFilters?.propertyTypes && (
            <PropertyTypeFilter
              selectedTypes={f.propertyTypesWithSubTypes ?? []}
              availableTypes={serverFilters.propertyTypes}
              onChange={(types) =>
                dispatch({
                  type: "MERGE_FILTERS",
                  partial: { propertyTypesWithSubTypes: types },
                })
              }
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom button */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingBottom: 20,
          paddingTop: 12,
          borderTopWidth: 0.5,
          borderTopColor: t.border,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            height: 50,
            borderRadius: 16,
            backgroundColor: "#0A84FF",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontFamily: "GeistSans-SemiBold",
              fontSize: 16,
            }}
          >
            {resultsText}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
