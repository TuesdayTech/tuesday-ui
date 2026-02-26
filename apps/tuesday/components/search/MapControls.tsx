import React from "react";
import { View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  NavigationArrow,
  MapTrifold,
  HandPointing,
} from "phosphor-react-native";
import { useThemeColors } from "../../hooks/useThemeColors";

interface MapControlsProps {
  onToggleMapType: () => void;
  onCenterUserLocation: () => void;
  onDrawBoundary: () => void;
  isHybrid: boolean;
}

export function MapControls({
  onToggleMapType,
  onCenterUserLocation,
  onDrawBoundary,
  isHybrid,
}: MapControlsProps) {
  const t = useThemeColors();
  const insets = useSafeAreaInsets();

  // Bottom bar occupies: insets.bottom + 58 (padding) + 48 (view results) + 8 (gap) + 48 (save search) = insets.bottom + 162
  // Place controls 16px above the bottom bar area
  const controlsBottom = insets.bottom + 162 + 16;

  const buttonStyle = {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: t.background,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  };

  return (
    <View
      style={{
        position: "absolute",
        left: 16,
        bottom: controlsBottom,
        gap: 10,
        zIndex: 8,
      }}
    >
      <Pressable
        style={buttonStyle}
        onPress={onToggleMapType}
        hitSlop={8}
      >
        <MapTrifold
          size={20}
          color={isHybrid ? "#0A84FF" : t.foreground}
          weight="regular"
        />
      </Pressable>

      <Pressable
        style={buttonStyle}
        onPress={onCenterUserLocation}
        hitSlop={8}
      >
        <NavigationArrow
          size={20}
          color={t.foreground}
          weight="regular"
        />
      </Pressable>

      <Pressable
        style={buttonStyle}
        onPress={onDrawBoundary}
        hitSlop={8}
      >
        <HandPointing
          size={20}
          color={t.foreground}
          weight="regular"
        />
      </Pressable>
    </View>
  );
}
