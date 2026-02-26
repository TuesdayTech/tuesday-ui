import React, { useRef, useEffect, useCallback, useState } from "react";
import { View, TextInput, Pressable, ScrollView, Text, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  MagnifyingGlass,
  Sliders,
  X,
  CaretLeft,
} from "phosphor-react-native";
import { useThemeColors } from "../../hooks/useThemeColors";
import { useSearchContext } from "../../providers/search-provider";
import { useRouter } from "expo-router";

export function MapSearchBar() {
  const t = useThemeColors();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const { state, dispatch, activeFiltersCount } = useSearchContext();
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const [localText, setLocalText] = useState("");

  const isFocused = state.isSearchFocused;
  const hasLocations =
    state.selectedLocations.length > 0 ||
    state.customBoundaryPoints.length > 0;

  // Debounce search text to provider
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({ type: "SET_SEARCH_TEXT", text: localText });
    }, 300);
    return () => clearTimeout(timer);
  }, [localText, dispatch]);

  const handleFocus = useCallback(() => {
    dispatch({ type: "SET_SEARCH_FOCUSED", focused: true });
  }, [dispatch]);

  const handleCancel = useCallback(() => {
    setLocalText("");
    dispatch({ type: "SET_SEARCH_FOCUSED", focused: false });
    inputRef.current?.blur();
  }, [dispatch]);

  const handleRemoveLocation = useCallback(
    (uid: string) => {
      dispatch({ type: "REMOVE_LOCATION", uid });
    },
    [dispatch],
  );

  const handleRemoveBoundary = useCallback(() => {
    dispatch({ type: "SET_CUSTOM_BOUNDARY", points: [] });
  }, [dispatch]);

  const barHeight = !isFocused && hasLocations ? 88 : 46;

  return (
    <View
      style={{
        position: "absolute",
        top: insets.top + 8,
        left: 16,
        right: 16,
        zIndex: 10,
      }}
    >
      <View className="flex-row" style={{ gap: 8 }}>
        {/* Back button when focused */}
        {isFocused && (
          <Pressable
            onPress={handleCancel}
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              backgroundColor: t.background,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 3,
            }}
          >
            <CaretLeft size={20} color={t.foreground} weight="bold" />
          </Pressable>
        )}

        {/* Search bar */}
        <View
          style={{
            flex: 1,
            height: barHeight,
            borderRadius: 23,
            backgroundColor: t.background,
            paddingHorizontal: 14,
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          {/* Input row */}
          <View className="flex-row items-center" style={{ height: 46, gap: 8 }}>
            <MagnifyingGlass
              size={18}
              color={t.foregroundMuted}
              weight="bold"
            />
            <TextInput
              ref={inputRef}
              value={localText}
              onChangeText={setLocalText}
              onFocus={handleFocus}
              placeholder="Search for listings on the MLS"
              placeholderTextColor={t.foregroundSubtle}
              style={{
                flex: 1,
                color: t.foreground,
                fontFamily: "GeistSans",
                fontSize: 15,
                padding: 0,
              }}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
            />
            {localText.length > 0 && (
              <Pressable onPress={() => setLocalText("")} hitSlop={8}>
                <X size={16} color={t.foregroundMuted} weight="bold" />
              </Pressable>
            )}
          </View>

          {/* Location pills (only when not focused and has locations) */}
          {!isFocused && hasLocations && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ height: 32, marginBottom: 8 }}
              contentContainerStyle={{ gap: 6 }}
            >
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
                      fontSize: 14,
                    }}
                  >
                    {loc.name}
                  </Text>
                  <Pressable
                    onPress={() => handleRemoveLocation(loc.uid)}
                    hitSlop={6}
                  >
                    <X size={14} color="#FFFFFF" weight="bold" />
                  </Pressable>
                </View>
              ))}

              {state.customBoundaryPoints.length >= 3 && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    height: 32,
                    paddingHorizontal: 12,
                    borderRadius: 16,
                    backgroundColor: "#8B5CF6",
                    gap: 6,
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontFamily: "GeistSans-Medium",
                      fontSize: 14,
                    }}
                  >
                    Boundary
                  </Text>
                  <Pressable onPress={handleRemoveBoundary} hitSlop={6}>
                    <X size={14} color="#FFFFFF" weight="bold" />
                  </Pressable>
                </View>
              )}
            </ScrollView>
          )}
        </View>

        {/* Filter button (only when not focused) */}
        {!isFocused && (
          <Pressable
            onPress={() => router.push("/search/filters")}
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              backgroundColor: t.background,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.12,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Sliders size={20} color={t.foreground} weight="regular" />
            {activeFiltersCount > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: "#0A84FF",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontFamily: "GeistSans-Bold",
                    fontSize: 11,
                  }}
                >
                  {activeFiltersCount}
                </Text>
              </View>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}
