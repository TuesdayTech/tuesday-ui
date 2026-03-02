import React, { useCallback, useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import {
  ChatCircleDots,
  EnvelopeSimple,
  FacebookLogo,
  XLogo,
  InstagramLogo,
  ShareNetwork,
} from "phosphor-react-native";
import { useThemeColors } from "../../hooks/useThemeColors";
import type { ShareType } from "../../types/listing-actions";
import { SOCIAL_NETWORKS } from "../../types/listing-actions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  ChatCircleDots,
  EnvelopeSimple,
  FacebookLogo,
  XLogo,
  InstagramLogo,
  ShareNetwork,
};

interface SocialNetworkSheetProps {
  bottomSheetRef: React.RefObject<BottomSheetModal | null>;
  onSelect: (type: ShareType) => void;
}

export function SocialNetworkSheet({
  bottomSheetRef,
  onSelect,
}: SocialNetworkSheetProps) {
  const t = useThemeColors();
  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
        opacity={0.4}
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      enablePanDownToClose
      enableDynamicSizing
      backgroundStyle={{
        backgroundColor: t.background,
        borderRadius: 20,
      }}
      handleIndicatorStyle={{ backgroundColor: t.foregroundMuted }}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetView style={{ paddingHorizontal: 16, paddingBottom: 40 }}>
        {/* Title */}
        <Text
          style={{
            fontFamily: "GeistSans-SemiBold",
            fontSize: 20,
            color: t.foreground,
            paddingTop: 24,
            paddingBottom: 24,
          }}
        >
          New Smart Share
        </Text>

        {/* Options */}
        <View style={{ gap: 24 }}>
          {SOCIAL_NETWORKS.map((option) => {
            const IconComponent = ICON_MAP[option.iconName];
            return (
              <Pressable
                key={option.type}
                onPress={() => {
                  bottomSheetRef.current?.dismiss();
                  onSelect(option.type);
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: option.circleColor,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {IconComponent && (
                    <IconComponent
                      size={20}
                      color={option.type === "More" ? t.foreground : "#FFFFFF"}
                      weight="fill"
                    />
                  )}
                </View>
                <Text
                  numberOfLines={1}
                  style={{
                    fontFamily: "GeistSans",
                    fontSize: 17,
                    color: t.foreground,
                    flex: 1,
                  }}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
