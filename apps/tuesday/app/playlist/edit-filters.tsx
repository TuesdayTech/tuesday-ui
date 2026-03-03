import React, { useCallback, useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { CaretLeft } from "phosphor-react-native";
import { useThemeColors } from "../../hooks/useThemeColors";
import { useAuth } from "../../providers/auth-provider";
import { usePlaylist, useUpdatePlaylist } from "../../hooks/use-playlists";
import { useFiltersOptions } from "../../hooks/use-filters-options";
import { getMlsType } from "../../lib/search/constants";
import { buildFiltersBody } from "../../lib/search/filters";
import { PriceRangeFilter } from "../../components/search/filters/PriceRangeFilter";
import { BedsAndBathsFilter } from "../../components/search/filters/BedsAndBathsFilter";
import { StatusFilter } from "../../components/search/filters/StatusFilter";
import { PropertyTypeFilter } from "../../components/search/filters/PropertyTypeFilter";
import { RangeInputRow } from "../../components/search/filters/RangeInputRow";
import type { SearchFilters, LocationFilter } from "../../types/search";
import type { Playlist } from "../../types/playlist";

// ── Playlist → local state converters ────────────────────────

function displayNameFromUid(uid: string): string {
  return uid.length > 5 ? uid.slice(5) : uid;
}

function playlistToFilters(p: Playlist): SearchFilters {
  return {
    propertyTypesWithSubTypes: p.propertyTypesWithSubTypes,
    standardStatus: p.standardStatuses,
    minPrice: p.minPrice,
    maxPrice: p.maxPrice,
    minBedrooms: p.minBedrooms,
    maxBedrooms: p.maxBedrooms,
    minBathrooms: p.minBathrooms,
    maxBathrooms: p.maxBathrooms,
    minLivingArea: p.minLivingArea,
    maxLivingArea: p.maxLivingArea,
    minLotSizeAcres: p.minLotSizeAcres,
    maxLotSizeAcres: p.maxLotSizeAcres,
    minYearBuilt: p.minYearBuilt,
    maxYearBuilt: p.maxYearBuilt,
    levels: p.levels,
  };
}

function playlistToLocations(p: Playlist): LocationFilter[] {
  const locations: LocationFilter[] = [];
  for (const uid of p.cityUIDs ?? []) {
    locations.push({ uid, name: displayNameFromUid(uid), type: "city" });
  }
  for (const uid of p.postalCodeUIDs ?? []) {
    locations.push({ uid, name: displayNameFromUid(uid), type: "zip" });
  }
  return locations;
}

// ── Screen ───────────────────────────────────────────────────

export default function EditFiltersScreen() {
  const t = useThemeColors();
  const router = useRouter();
  const { uid } = useLocalSearchParams<{ uid: string }>();
  const { profile } = useAuth();
  const profileUid = profile?.UID ?? "";
  const playlistUid = uid ?? "";

  const { data: playlist, isLoading: isPlaylistLoading } = usePlaylist(
    playlistUid,
    profileUid,
  );
  const updatePlaylist = useUpdatePlaylist();

  const mlsType = getMlsType(profile?.UID);
  const { data: serverFilters } = useFiltersOptions(mlsType);

  // ── Local filter state ─────────────────────────────────────
  const [filters, setFilters] = useState<SearchFilters>({});
  const [locations, setLocations] = useState<LocationFilter[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Text inputs for debounced fields
  const [minLiving, setMinLiving] = useState("");
  const [maxLiving, setMaxLiving] = useState("");
  const [minLot, setMinLot] = useState("");
  const [maxLot, setMaxLot] = useState("");
  const [minYear, setMinYear] = useState("");
  const [maxYear, setMaxYear] = useState("");

  // Hydrate all state from playlist (once)
  useEffect(() => {
    if (playlist && !hydrated) {
      const f = playlistToFilters(playlist);
      setFilters(f);
      setLocations(playlistToLocations(playlist));
      setMinLiving(f.minLivingArea != null ? String(f.minLivingArea) : "");
      setMaxLiving(f.maxLivingArea != null ? String(f.maxLivingArea) : "");
      setMinLot(f.minLotSizeAcres != null ? String(f.minLotSizeAcres) : "");
      setMaxLot(f.maxLotSizeAcres != null ? String(f.maxLotSizeAcres) : "");
      setMinYear(f.minYearBuilt != null ? String(f.minYearBuilt) : "");
      setMaxYear(f.maxYearBuilt != null ? String(f.maxYearBuilt) : "");
      setHydrated(true);
    }
  }, [playlist, hydrated]);

  // ── Filter helpers ─────────────────────────────────────────

  const mergeFilters = useCallback((partial: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  }, []);

  const removeLocation = useCallback((locUid: string) => {
    setLocations((prev) => prev.filter((l) => l.uid !== locUid));
  }, []);

  const handleReset = useCallback(() => {
    if (!playlist) return;
    const f = playlistToFilters(playlist);
    setFilters(f);
    setLocations(playlistToLocations(playlist));
    setMinLiving(f.minLivingArea != null ? String(f.minLivingArea) : "");
    setMaxLiving(f.maxLivingArea != null ? String(f.maxLivingArea) : "");
    setMinLot(f.minLotSizeAcres != null ? String(f.minLotSizeAcres) : "");
    setMaxLot(f.maxLotSizeAcres != null ? String(f.maxLotSizeAcres) : "");
    setMinYear(f.minYearBuilt != null ? String(f.minYearBuilt) : "");
    setMaxYear(f.maxYearBuilt != null ? String(f.maxYearBuilt) : "");
  }, [playlist]);

  // ── Debounce text inputs → filters ─────────────────────────

  useEffect(() => {
    if (!hydrated) return;
    const timer = setTimeout(() => {
      mergeFilters({
        minLivingArea: minLiving ? parseInt(minLiving, 10) : undefined,
        maxLivingArea: maxLiving ? parseInt(maxLiving, 10) : undefined,
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [minLiving, maxLiving, hydrated, mergeFilters]);

  useEffect(() => {
    if (!hydrated) return;
    const timer = setTimeout(() => {
      mergeFilters({
        minLotSizeAcres: minLot ? parseFloat(minLot) : undefined,
        maxLotSizeAcres: maxLot ? parseFloat(maxLot) : undefined,
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [minLot, maxLot, hydrated, mergeFilters]);

  useEffect(() => {
    if (!hydrated) return;
    const timer = setTimeout(() => {
      mergeFilters({
        minYearBuilt: minYear ? parseInt(minYear, 10) : undefined,
        maxYearBuilt: maxYear ? parseInt(maxYear, 10) : undefined,
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [minYear, maxYear, hydrated, mergeFilters]);

  // ── Save handler ───────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!profileUid || !playlistUid) return;

    try {
      await updatePlaylist.mutateAsync({
        profileUid,
        playlistUid,
        filters: {
          ...buildFiltersBody(filters),
          cityUID: locations
            .filter((l) => l.type === "city")
            .map((l) => l.uid),
          postalCodeUID: locations
            .filter((l) => l.type === "zip")
            .map((l) => l.uid),
        },
      });
      router.back();
    } catch {
      Alert.alert("Error", "Failed to save changes. Please try again.");
    }
  }, [profileUid, playlistUid, filters, locations, updatePlaylist, router]);

  // ── Derived ────────────────────────────────────────────────

  const isSingleLevel = filters.levels?.includes("One") ?? false;

  // ── Loading state ──────────────────────────────────────────

  if (isPlaylistLoading || !hydrated) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: t.background }}
        edges={["top"]}
      >
        <View
          style={{
            height: 52,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: t.foreground,
              fontFamily: "GeistSans-SemiBold",
              fontSize: 17,
            }}
          >
            Edit filters
          </Text>
          <Pressable
            hitSlop={8}
            onPress={() => router.back()}
            style={{
              position: "absolute",
              left: 16,
              top: 0,
              bottom: 0,
              justifyContent: "center",
            }}
          >
            <CaretLeft size={22} color={t.foreground} weight="bold" />
          </Pressable>
        </View>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color={t.foreground} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Main render ────────────────────────────────────────────

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
          Edit filters
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
          {locations.length > 0 && (
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
                {locations.map((loc) => (
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
                      onPress={() => removeLocation(loc.uid)}
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
            selectedStatuses={filters.standardStatus ?? []}
            onChange={(statuses) =>
              mergeFilters({ standardStatus: statuses })
            }
          />

          {/* Price */}
          <PriceRangeFilter
            minPrice={filters.minPrice}
            maxPrice={filters.maxPrice}
            onChange={(min, max) => mergeFilters({ minPrice: min, maxPrice: max })}
          />

          {/* Bedrooms */}
          <BedsAndBathsFilter
            label="Bedrooms"
            minValue={filters.minBedrooms}
            onChange={(min) =>
              mergeFilters({ minBedrooms: min, maxBedrooms: undefined })
            }
          />

          {/* Bathrooms */}
          <BedsAndBathsFilter
            label="Bathrooms"
            minValue={filters.minBathrooms}
            onChange={(min) =>
              mergeFilters({ minBathrooms: min, maxBathrooms: undefined })
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
                mergeFilters({ levels: val ? ["One"] : undefined })
              }
              trackColor={{ true: "#0A84FF", false: t.backgroundTertiary }}
            />
          </View>

          {/* Property Types */}
          {serverFilters?.propertyTypes && (
            <PropertyTypeFilter
              selectedTypes={filters.propertyTypesWithSubTypes ?? []}
              availableTypes={serverFilters.propertyTypes}
              onChange={(types) =>
                mergeFilters({ propertyTypesWithSubTypes: types })
              }
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save button */}
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
          onPress={handleSave}
          disabled={updatePlaylist.isPending}
          style={{
            height: 50,
            borderRadius: 16,
            backgroundColor: "#0A84FF",
            alignItems: "center",
            justifyContent: "center",
            opacity: updatePlaylist.isPending ? 0.6 : 1,
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontFamily: "GeistSans-SemiBold",
              fontSize: 16,
            }}
          >
            {updatePlaylist.isPending ? "Saving..." : "Save"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
