import React, { useState } from "react";
import { View, Text, Pressable, Modal, ScrollView } from "react-native";
import { Check } from "phosphor-react-native";
import { useThemeColors } from "../../../hooks/useThemeColors";
import {
  DEFAULT_STATUSES,
  CLOSED_STATUSES,
  ALL_STATUSES,
  STATUS_EMOJI,
} from "../../../lib/search/constants";

interface StatusFilterProps {
  selectedStatuses: string[];
  onChange: (statuses: string[]) => void;
}

type StatusPreset = "active" | "closed" | "custom";

function getPreset(statuses: string[]): StatusPreset {
  if (
    statuses.length === DEFAULT_STATUSES.length &&
    DEFAULT_STATUSES.every((s) => statuses.includes(s))
  ) {
    return "active";
  }
  if (
    statuses.length === 1 &&
    statuses[0] === "Closed"
  ) {
    return "closed";
  }
  return "custom";
}

export function StatusFilter({
  selectedStatuses,
  onChange,
}: StatusFilterProps) {
  const t = useThemeColors();
  const [showCustom, setShowCustom] = useState(false);
  const preset = getPreset(selectedStatuses);

  const handlePreset = (p: StatusPreset) => {
    if (p === "active") onChange([...DEFAULT_STATUSES]);
    else if (p === "closed") onChange([...CLOSED_STATUSES]);
    else setShowCustom(true);
  };

  const toggleStatus = (status: string) => {
    if (selectedStatuses.includes(status)) {
      const next = selectedStatuses.filter((s) => s !== status);
      if (next.length > 0) onChange(next);
    } else {
      onChange([...selectedStatuses, status]);
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
        Standard status
      </Text>

      {/* Segmented control */}
      <View
        className="flex-row"
        style={{
          backgroundColor: t.backgroundSecondary,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: t.border,
          padding: 3,
        }}
      >
        {(["active", "closed", "custom"] as StatusPreset[]).map((p) => {
          const isActive = preset === p;
          return (
            <Pressable
              key={p}
              onPress={() => handlePreset(p)}
              style={{
                flex: 1,
                height: 36,
                borderRadius: 8,
                backgroundColor: isActive ? "#0A84FF" : "transparent",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: isActive ? "#FFFFFF" : t.foreground,
                  fontFamily: "GeistSans-Medium",
                  fontSize: 14,
                  textTransform: "capitalize",
                }}
              >
                {p}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Custom status modal */}
      <Modal visible={showCustom} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: t.background,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              maxHeight: 500,
              paddingBottom: 40,
            }}
          >
            {/* Handle */}
            <View
              style={{
                alignSelf: "center",
                width: 36,
                height: 5,
                borderRadius: 2.5,
                backgroundColor: t.foregroundSubtle,
                marginTop: 10,
                marginBottom: 16,
              }}
            />
            <Text
              style={{
                color: t.foreground,
                fontFamily: "GeistSans-SemiBold",
                fontSize: 18,
                paddingHorizontal: 20,
                marginBottom: 12,
              }}
            >
              Select statuses
            </Text>
            <ScrollView style={{ paddingHorizontal: 20 }}>
              {ALL_STATUSES.map((status) => {
                const isSelected = selectedStatuses.includes(status);
                const emoji = STATUS_EMOJI[status] ?? "";
                return (
                  <Pressable
                    key={status}
                    onPress={() => toggleStatus(status)}
                    className="flex-row items-center"
                    style={{
                      paddingVertical: 14,
                      borderBottomWidth: 0.5,
                      borderBottomColor: t.border,
                      gap: 12,
                    }}
                  >
                    <Text style={{ fontSize: 18 }}>{emoji}</Text>
                    <Text
                      style={{
                        flex: 1,
                        color: t.foreground,
                        fontFamily: "GeistSans-Medium",
                        fontSize: 15,
                      }}
                    >
                      {status}
                    </Text>
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: isSelected ? "#0A84FF" : t.border,
                        backgroundColor: isSelected ? "#0A84FF" : "transparent",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {isSelected && (
                        <Check size={14} color="#FFFFFF" weight="bold" />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
            <Pressable
              onPress={() => setShowCustom(false)}
              style={{
                marginHorizontal: 20,
                marginTop: 16,
                height: 50,
                borderRadius: 12,
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
                Done
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
