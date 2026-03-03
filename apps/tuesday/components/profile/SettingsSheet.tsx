import React, { useState } from "react";
import { View, Text, Pressable, Alert, Linking, ActivityIndicator, StyleSheet } from "react-native";
import {
  Heart,
  Star,
  Newspaper,
  Envelope,
  UserCircle,
  CaretRight,
  CaretLeft,
  SignOut,
  UserMinus,
  Eye,
  Crown,
} from "phosphor-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "../../hooks/useThemeColors";
import type { MLSType } from "../../hooks/use-developer-mode";
import { MLS_TYPES } from "../../hooks/use-developer-mode";

interface SettingsSheetProps {
  visible: boolean;
  onClose: () => void;
  onYourLikes?: () => void;
  onLogout?: () => void;
  onDeleteAccount?: () => void;
  /** Superadmin features */
  isSuperAdmin?: boolean;
  developerMode?: boolean;
  onToggleDeveloperMode?: () => void;
  /** MLS switching (dev mode only) */
  selectedMLS?: MLSType;
  isSwitchingMLS?: boolean;
  onSwitchMLS?: (mlsType: MLSType) => void;
}

interface SettingsItemProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  color?: string;
  rightElement?: React.ReactNode;
}

function SettingsItem({ icon, label, onPress, color, rightElement }: SettingsItemProps) {
  const t = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 12,
      }}
    >
      {icon}
      <Text
        style={{
          fontFamily: "GeistSans-Medium",
          fontSize: 17,
          color: color ?? t.foreground,
          flex: 1,
        }}
      >
        {label}
      </Text>
      {rightElement ?? <CaretRight size={16} color={t.foregroundSubtle} weight="bold" />}
    </Pressable>
  );
}

function MLSPicker({
  selected,
  isLoading,
  onSelect,
}: {
  selected: MLSType;
  isLoading: boolean;
  onSelect: (type: MLSType) => void;
}) {
  const t = useThemeColors();

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: t.backgroundTertiary,
          borderRadius: 8,
          padding: 2,
          opacity: isLoading ? 0.5 : 1,
        }}
      >
        {MLS_TYPES.map((type) => {
          const isSelected = type === selected;
          return (
            <Pressable
              key={type}
              onPress={() => onSelect(type)}
              disabled={isLoading}
              style={{
                flex: 1,
                paddingVertical: 8,
                alignItems: "center",
                borderRadius: 6,
                backgroundColor: isSelected ? t.background : "transparent",
              }}
            >
              <Text
                style={{
                  fontFamily: isSelected ? "GeistSans-SemiBold" : "GeistSans",
                  fontSize: 12,
                  color: isSelected ? t.foreground : t.foregroundMuted,
                }}
              >
                {type}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {isLoading && (
        <ActivityIndicator
          size="small"
          style={{ marginTop: 8 }}
          color={t.foregroundMuted}
        />
      )}
    </View>
  );
}

export function SettingsSheet({
  visible,
  onClose,
  onYourLikes,
  onLogout,
  onDeleteAccount,
  isSuperAdmin = false,
  developerMode = false,
  onToggleDeveloperMode,
  selectedMLS = "All",
  isSwitchingMLS = false,
  onSwitchMLS,
}: SettingsSheetProps) {
  const t = useThemeColors();
  const insets = useSafeAreaInsets();
  const [showAccount, setShowAccount] = useState(false);
  const iconSize = 24;

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            onDeleteAccount?.();
            onClose();
          },
        },
      ],
    );
  };

  const handleClose = () => {
    setShowAccount(false);
    onClose();
  };

  const handleRateUs = () => {
    Linking.openURL("https://itunes.apple.com/app/id6499072102?action=write-review");
  };

  const handleSupport = () => {
    Linking.openURL("mailto:support@ontuesday.com");
  };

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Pressable
        onPress={handleClose}
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}
      />
      <View
        style={{
          backgroundColor: t.backgroundSecondary,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          paddingBottom: insets.bottom + 16,
        }}
      >
        {/* Drag indicator */}
        <View style={{ alignItems: "center", paddingVertical: 12 }}>
          <View
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              backgroundColor: t.foregroundSubtle,
              opacity: 0.3,
            }}
          />
        </View>

        {!showAccount ? (
          <View>
            {/* Developer Mode toggle — superadmin only */}
            {isSuperAdmin && (
              <SettingsItem
                icon={<Eye size={iconSize} color={t.foreground} weight="regular" />}
                label="Developer Mode"
                onPress={() => onToggleDeveloperMode?.()}
                rightElement={
                  <Pressable
                    onPress={() => onToggleDeveloperMode?.()}
                    style={{
                      width: 48,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: developerMode ? t.foreground : t.backgroundTertiary,
                      justifyContent: "center",
                      paddingHorizontal: 2,
                    }}
                  >
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: "#FFFFFF",
                        alignSelf: developerMode ? "flex-end" : "flex-start",
                      }}
                    />
                  </Pressable>
                }
              />
            )}

            {/* MLS Type picker — superadmin + dev mode only */}
            {isSuperAdmin && developerMode && onSwitchMLS && (
              <MLSPicker
                selected={selectedMLS}
                isLoading={isSwitchingMLS}
                onSelect={onSwitchMLS}
              />
            )}

            {/* Tuesday Pro — dev mode only */}
            {developerMode && (
              <SettingsItem
                icon={<Crown size={iconSize} color={t.foreground} weight="regular" />}
                label="Tuesday Pro"
                onPress={() => {
                  // TODO: Open subscription settings
                }}
              />
            )}

            <SettingsItem
              icon={<Heart size={iconSize} color={t.foreground} weight="regular" />}
              label="Your Likes"
              onPress={() => {
                onYourLikes?.();
                handleClose();
              }}
            />
            <SettingsItem
              icon={<Star size={iconSize} color={t.foreground} weight="regular" />}
              label="Rate Us"
              onPress={handleRateUs}
            />
            <SettingsItem
              icon={<Newspaper size={iconSize} color={t.foreground} weight="regular" />}
              label="FAQ"
              onPress={() => {
                // TODO: Open FAQ sheet
              }}
            />
            <SettingsItem
              icon={<Envelope size={iconSize} color={t.foreground} weight="regular" />}
              label="Support"
              onPress={handleSupport}
            />
            <SettingsItem
              icon={<UserCircle size={iconSize} color={t.foreground} weight="regular" />}
              label="Account"
              onPress={() => setShowAccount(true)}
            />
          </View>
        ) : (
          <View>
            <Pressable
              onPress={() => setShowAccount(false)}
              style={{ paddingHorizontal: 16, paddingVertical: 12 }}
            >
              <CaretLeft size={24} color={t.foreground} weight="bold" />
            </Pressable>

            <SettingsItem
              icon={<SignOut size={iconSize} color={t.foreground} weight="regular" />}
              label="Log Out"
              onPress={() => {
                onLogout?.();
                handleClose();
              }}
            />
            <SettingsItem
              icon={<UserMinus size={iconSize} color="#E5484D" weight="regular" />}
              label="Delete Account"
              onPress={handleDeleteAccount}
              color="#E5484D"
            />
          </View>
        )}
      </View>
    </View>
  );
}
