import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { CaretDown, CaretUp, Check } from "phosphor-react-native";
import { useThemeColors } from "../../../hooks/useThemeColors";
import type { TypeWithValues, FiltersSearchType } from "../../../types/search";

interface PropertyTypeFilterProps {
  selectedTypes: TypeWithValues[];
  availableTypes: FiltersSearchType[];
  onChange: (types: TypeWithValues[]) => void;
}

export function PropertyTypeFilter({
  selectedTypes,
  availableTypes,
  onChange,
}: PropertyTypeFilterProps) {
  const t = useThemeColors();
  const [expandedType, setExpandedType] = useState<string | null>(null);

  const isTypeSelected = (typeCode: string) =>
    selectedTypes.some((t) => t.type === typeCode);

  const getSelectedSubtypes = (typeCode: string) =>
    selectedTypes.find((t) => t.type === typeCode)?.values ?? [];

  const toggleType = (typeCode: string, allSubtypes: string[]) => {
    if (isTypeSelected(typeCode)) {
      onChange(selectedTypes.filter((t) => t.type !== typeCode));
    } else {
      onChange([...selectedTypes, { type: typeCode, values: [] }]);
    }
  };

  const toggleSubtype = (typeCode: string, subtype: string, allSubtypes: string[]) => {
    const existing = selectedTypes.find((t) => t.type === typeCode);
    if (!existing) {
      // Type not selected yet — add type with just this subtype
      onChange([...selectedTypes, { type: typeCode, values: [subtype] }]);
      return;
    }

    const hasSubtype = existing.values.includes(subtype);
    let newValues: string[];
    if (hasSubtype) {
      newValues = existing.values.filter((v) => v !== subtype);
    } else {
      newValues = [...existing.values, subtype];
    }

    // If all subtypes selected or none, use empty array (= all)
    if (newValues.length === 0) {
      onChange(selectedTypes.filter((t) => t.type !== typeCode));
    } else {
      onChange(
        selectedTypes.map((t) =>
          t.type === typeCode ? { ...t, values: newValues } : t,
        ),
      );
    }
  };

  return (
    <View>
      <Text
        style={{
          color: t.foreground,
          fontFamily: "GeistSans-SemiBold",
          fontSize: 15,
          marginBottom: 10,
        }}
      >
        Property type
      </Text>

      {availableTypes.map((pt) => {
        const typeCode = pt.type ?? "";
        const title = pt.title ?? typeCode;
        const subtypes = (pt.values ?? []).filter(Boolean) as string[];
        const isExpanded = expandedType === typeCode;
        const isChecked = isTypeSelected(typeCode);
        const selectedSubs = getSelectedSubtypes(typeCode);
        const subCount =
          selectedSubs.length > 0
            ? ` (${selectedSubs.length})`
            : isChecked
              ? ""
              : "";

        return (
          <View key={typeCode}>
            {/* Type header row */}
            <Pressable
              className="flex-row items-center"
              style={{
                paddingVertical: 14,
                borderBottomWidth: 0.5,
                borderBottomColor: t.border,
                gap: 12,
              }}
              onPress={() => toggleType(typeCode, subtypes)}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  borderWidth: 2,
                  borderColor: isChecked ? "#0A84FF" : t.border,
                  backgroundColor: isChecked ? "#0A84FF" : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isChecked && (
                  <Check size={14} color="#FFFFFF" weight="bold" />
                )}
              </View>
              <Text
                style={{
                  flex: 1,
                  color: t.foreground,
                  fontFamily: "GeistSans-Medium",
                  fontSize: 15,
                }}
              >
                {title}
                {subCount}
              </Text>
              {subtypes.length > 0 && (
                <Pressable
                  onPress={() =>
                    setExpandedType(isExpanded ? null : typeCode)
                  }
                  hitSlop={8}
                >
                  {isExpanded ? (
                    <CaretUp size={16} color={t.foregroundMuted} weight="bold" />
                  ) : (
                    <CaretDown
                      size={16}
                      color={t.foregroundMuted}
                      weight="bold"
                    />
                  )}
                </Pressable>
              )}
            </Pressable>

            {/* Subtypes (expanded) */}
            {isExpanded &&
              subtypes.map((sub) => {
                const isSubChecked =
                  selectedSubs.length === 0 || selectedSubs.includes(sub);
                return (
                  <Pressable
                    key={sub}
                    className="flex-row items-center"
                    style={{
                      paddingVertical: 12,
                      paddingLeft: 40,
                      borderBottomWidth: 0.5,
                      borderBottomColor: t.border,
                      gap: 12,
                    }}
                    onPress={() => toggleSubtype(typeCode, sub, subtypes)}
                  >
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 5,
                        borderWidth: 2,
                        borderColor: isSubChecked ? "#0A84FF" : t.border,
                        backgroundColor: isSubChecked
                          ? "#0A84FF"
                          : "transparent",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {isSubChecked && (
                        <Check size={12} color="#FFFFFF" weight="bold" />
                      )}
                    </View>
                    <Text
                      style={{
                        color: t.foreground,
                        fontFamily: "GeistSans",
                        fontSize: 14,
                      }}
                    >
                      {sub}
                    </Text>
                  </Pressable>
                );
              })}
          </View>
        );
      })}
    </View>
  );
}
