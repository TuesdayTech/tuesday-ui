import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, Keyboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import {
  MapPin,
  Buildings,
  NavigationArrow,
  ArrowUpRight,
} from "phosphor-react-native";
import { useColorScheme } from "react-native";
import { useThemeColors } from "../../hooks/useThemeColors";
import { useSearchContext } from "../../providers/search-provider";
import { useAreaSearch } from "../../hooks/use-area-search";
import {
  getRecentSearches,
  addRecentSearch,
  removeRecentSearch,
} from "../../lib/search/recent-searches";
import type {
  AreaType,
  RecentSearch,
  SearchAreaResult,
} from "../../types/search";

function getAreaType(uid: string): AreaType {
  return uid.startsWith("2") ? "zip" : "city";
}

function getAreaName(area: SearchAreaResult): string {
  return area.FullName ?? area.UID;
}

interface SearchOverlayProps {
  onCenterLocation?: () => void;
}

export function SearchOverlay({ onCenterLocation }: SearchOverlayProps) {
  const t = useThemeColors();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const { state, dispatch } = useSearchContext();
  const { data: searchResults, isLoading } = useAreaSearch(state.searchText);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  // Load recent searches on mount
  useEffect(() => {
    getRecentSearches().then(setRecentSearches);
  }, []);

  const handleDismiss = useCallback(() => {
    Keyboard.dismiss();
    dispatch({ type: "SET_SEARCH_FOCUSED", focused: false });
  }, [dispatch]);

  const handleSelectArea = useCallback(
    async (area: SearchAreaResult) => {
      const type = getAreaType(area.UID);
      const name = getAreaName(area);

      Keyboard.dismiss();
      dispatch({
        type: "ADD_LOCATION",
        location: { uid: area.UID, name, type },
      });
      dispatch({ type: "SET_SEARCH_FOCUSED", focused: false });

      // Save to recent searches
      const updated = await addRecentSearch({ uid: area.UID, name, type });
      setRecentSearches(updated);
    },
    [dispatch],
  );

  const handleCurrentLocation = useCallback(() => {
    Keyboard.dismiss();
    dispatch({ type: "SET_SEARCH_FOCUSED", focused: false });
    onCenterLocation?.();
  }, [dispatch, onCenterLocation]);

  const handleRemoveRecent = useCallback(async (uid: string) => {
    const updated = await removeRecentSearch(uid);
    setRecentSearches(updated);
  }, []);

  // Split results into cities and ZIP codes
  const cities =
    searchResults?.areas?.filter((a) => getAreaType(a.UID) === "city") ?? [];
  const zips =
    searchResults?.areas?.filter((a) => getAreaType(a.UID) === "zip") ?? [];

  const hasSearchText = state.searchText.trim().length >= 2;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 5,
      }}
    >
      <BlurView
        intensity={60}
        tint={scheme === "dark" ? "dark" : "light"}
        style={{ flex: 1 }}
      >
        <Pressable
          onPress={handleDismiss}
          style={{
            flex: 1,
            backgroundColor:
              scheme === "dark"
                ? "rgba(0,0,0,0.7)"
                : "rgba(255,255,255,0.75)",
          }}
        >
          {/* Content starts below search bar */}
          <ScrollView
            style={{ marginTop: insets.top + 64 }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Current Location button */}
            <Pressable
              onPress={handleCurrentLocation}
              className="flex-row items-center"
              style={{ paddingVertical: 14, gap: 12 }}
            >
              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: "rgba(10, 132, 255, 0.15)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <NavigationArrow size={16} color="#0A84FF" weight="fill" />
              </View>
              <Text
                style={{
                  color: "#0A84FF",
                  fontFamily: "GeistSans-Medium",
                  fontSize: 15,
                }}
              >
                Current Location
              </Text>
            </Pressable>

            <View
              style={{
                height: 0.5,
                backgroundColor: t.border,
                marginVertical: 4,
              }}
            />

            {/* Recent Searches (when not typing) */}
            {!hasSearchText && recentSearches.length > 0 && (
              <View style={{ marginTop: 16 }}>
                <Text
                  style={{
                    color: t.foregroundMuted,
                    fontFamily: "GeistSans-SemiBold",
                    fontSize: 14,
                    marginBottom: 8,
                  }}
                >
                  Recent Searches
                </Text>
                {recentSearches.map((recent) => (
                  <SearchResultRow
                    key={recent.uid}
                    icon={
                      recent.type === "city" ? (
                        <Buildings size={18} color={t.foregroundMuted} weight="regular" />
                      ) : (
                        <MapPin size={18} color={t.foregroundMuted} weight="regular" />
                      )
                    }
                    title={recent.name}
                    subtitle={recent.subtitle}
                    onPress={() =>
                      handleSelectArea({
                        UID: recent.uid,
                        FullName: recent.name,
                      })
                    }
                    foreground={t.foreground}
                    foregroundMuted={t.foregroundMuted}
                  />
                ))}
              </View>
            )}

            {/* ZIP Codes results */}
            {hasSearchText && zips.length > 0 && (
              <View style={{ marginTop: 16 }}>
                <Text
                  style={{
                    color: t.foregroundMuted,
                    fontFamily: "GeistSans-SemiBold",
                    fontSize: 14,
                    marginBottom: 8,
                  }}
                >
                  ZIP Codes
                </Text>
                {zips.slice(0, 5).map((area) => (
                  <SearchResultRow
                    key={area.UID}
                    icon={
                      <MapPin
                        size={18}
                        color={t.foregroundMuted}
                        weight="regular"
                      />
                    }
                    title={getAreaName(area)}
                    onPress={() => handleSelectArea(area)}
                    foreground={t.foreground}
                    foregroundMuted={t.foregroundMuted}
                  />
                ))}
              </View>
            )}

            {/* Cities results */}
            {hasSearchText && cities.length > 0 && (
              <View style={{ marginTop: 16 }}>
                <Text
                  style={{
                    color: t.foregroundMuted,
                    fontFamily: "GeistSans-SemiBold",
                    fontSize: 14,
                    marginBottom: 8,
                  }}
                >
                  Cities
                </Text>
                {cities.slice(0, 5).map((area) => (
                  <SearchResultRow
                    key={area.UID}
                    icon={
                      <Buildings
                        size={18}
                        color={t.foregroundMuted}
                        weight="regular"
                      />
                    }
                    title={getAreaName(area)}
                    onPress={() => handleSelectArea(area)}
                    foreground={t.foreground}
                    foregroundMuted={t.foregroundMuted}
                  />
                ))}
              </View>
            )}

            {/* No results */}
            {hasSearchText &&
              !isLoading &&
              cities.length === 0 &&
              zips.length === 0 && (
                <Text
                  style={{
                    color: t.foregroundMuted,
                    fontFamily: "GeistSans",
                    fontSize: 15,
                    textAlign: "center",
                    marginTop: 40,
                  }}
                >
                  No results found
                </Text>
              )}
          </ScrollView>
        </Pressable>
      </BlurView>
    </View>
  );
}

// ── Search Result Row ────────────────────────────────────────────────

interface SearchResultRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  foreground: string;
  foregroundMuted: string;
}

function SearchResultRow({
  icon,
  title,
  subtitle,
  onPress,
  foreground,
  foregroundMuted,
}: SearchResultRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center"
      style={{ paddingVertical: 12, gap: 12 }}
    >
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: "rgba(128,128,128,0.12)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: foreground,
            fontFamily: "GeistSans-Medium",
            fontSize: 15,
          }}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              color: foregroundMuted,
              fontFamily: "GeistSans-Light",
              fontSize: 12,
            }}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>
      <ArrowUpRight size={16} color={foregroundMuted} weight="regular" />
    </Pressable>
  );
}
