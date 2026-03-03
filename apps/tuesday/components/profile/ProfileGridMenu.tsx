import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { CaretDown, MapPin } from "phosphor-react-native";
import { useThemeColors } from "../../hooks/useThemeColors";
import type { ProfileSortOrder } from "../../types/profile";

const SORT_OPTIONS: { value: ProfileSortOrder; label: string }[] = [
  { value: "recent", label: "Most recent" },
  { value: "highest", label: "Highest price" },
];

interface ProfileGridMenuProps {
  sortOrder: ProfileSortOrder;
  onSortChange: (order: ProfileSortOrder) => void;
  onMapPress?: () => void;
}

export function ProfileGridMenu({
  sortOrder,
  onSortChange,
  onMapPress,
}: ProfileGridMenuProps) {
  const t = useThemeColors();
  const [showDropdown, setShowDropdown] = useState(false);
  const currentLabel = SORT_OPTIONS.find((o) => o.value === sortOrder)?.label ?? "Recent";

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        paddingTop: 21,
        paddingBottom: 8,
      }}
    >
      <View style={{ position: "relative" }}>
        <Pressable
          onPress={() => setShowDropdown(!showDropdown)}
          style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
        >
          <Text
            style={{
              fontFamily: "GeistSans-SemiBold",
              fontSize: 14,
              color: t.foreground,
            }}
          >
            {currentLabel}
          </Text>
          <CaretDown size={14} color={t.foreground} weight="bold" />
        </Pressable>

        {showDropdown && (
          <View
            style={{
              position: "absolute",
              top: 28,
              left: 0,
              backgroundColor: t.backgroundSecondary,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: t.border,
              paddingVertical: 4,
              minWidth: 160,
              zIndex: 100,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            {SORT_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => {
                  onSortChange(option.value);
                  setShowDropdown(false);
                }}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  backgroundColor:
                    option.value === sortOrder ? t.backgroundTertiary : "transparent",
                }}
              >
                <Text
                  style={{
                    fontFamily:
                      option.value === sortOrder
                        ? "GeistSans-SemiBold"
                        : "GeistSans",
                    fontSize: 14,
                    color: t.foreground,
                  }}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <Pressable onPress={onMapPress} hitSlop={8}>
        <MapPin size={20} color={t.foreground} weight="bold" />
      </Pressable>
    </View>
  );
}
