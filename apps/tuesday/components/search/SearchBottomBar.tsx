import React from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "../../hooks/useThemeColors";
import { useSearchContext } from "../../providers/search-provider";

interface SearchBottomBarProps {
  onSaveSearch?: () => void;
}

export function SearchBottomBar({
  onSaveSearch,
}: SearchBottomBarProps = {}) {
  const t = useThemeColors();
  const insets = useSafeAreaInsets();
  const { state, dispatch } = useSearchContext();

  const isMap = state.viewMode === "map";
  const hasLocation =
    state.selectedLocations.length > 0 ||
    state.customBoundaryPoints.length >= 3;

  const handleToggleView = () => {
    dispatch({
      type: "SET_VIEW_MODE",
      mode: isMap ? "grid" : "map",
    });
  };

  // Format results text
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
  if (!isMap) resultsText = "Back to map";

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 8,
        paddingHorizontal: 16,
        paddingBottom: insets.bottom + 58,
        gap: 8,
      }}
      pointerEvents="box-none"
    >
      {/* Save search button */}
      {isMap && (
        <Pressable
          onPress={onSaveSearch}
          disabled={!hasLocation}
          style={({ pressed }) => ({
            height: 48,
            borderRadius: 24,
            backgroundColor: "#0A84FF",
            alignItems: "center",
            justifyContent: "center",
            opacity: !hasLocation ? 0.45 : pressed ? 0.85 : 1,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4,
          })}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontFamily: "GeistSans-SemiBold",
              fontSize: 16,
            }}
          >
            {hasLocation ? "Save search" : "Add location to save"}
          </Text>
        </Pressable>
      )}

      {/* Results / back to map button */}
      <Pressable
        onPress={handleToggleView}
        style={({ pressed }) => ({
          height: 48,
          borderRadius: 24,
          backgroundColor: t.background,
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.85 : 1,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.12,
          shadowRadius: 8,
          elevation: 3,
        })}
      >
        {state.isLoading && isMap ? (
          <ActivityIndicator size="small" color="#0A84FF" />
        ) : (
          <Text
            style={{
              color: "#0A84FF",
              fontFamily: "GeistSans-SemiBold",
              fontSize: 16,
            }}
          >
            {resultsText}
          </Text>
        )}
      </Pressable>
    </View>
  );
}
