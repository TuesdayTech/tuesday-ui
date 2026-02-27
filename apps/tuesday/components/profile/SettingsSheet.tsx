import React, { useState } from "react";
import { View, Text, Pressable, Modal, Alert, Linking } from "react-native";
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
} from "phosphor-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "../../hooks/useThemeColors";
import Animated, {
  FadeIn,
  FadeOut,
} from "react-native-reanimated";

interface SettingsSheetProps {
  visible: boolean;
  onClose: () => void;
  onYourLikes?: () => void;
  onLogout?: () => void;
  onDeleteAccount?: () => void;
}

interface SettingsItemProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  color?: string;
}

function SettingsItem({ icon, label, onPress, color }: SettingsItemProps) {
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
      <CaretRight size={16} color={t.foregroundSubtle} weight="bold" />
    </Pressable>
  );
}

export function SettingsSheet({
  visible,
  onClose,
  onYourLikes,
  onLogout,
  onDeleteAccount,
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
    // TODO: Replace with actual App Store URL
    Linking.openURL("https://apps.apple.com");
  };

  const handleSupport = () => {
    Linking.openURL("mailto:support@ontuesday.com");
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
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
          <Animated.View entering={FadeIn.duration(100)} exiting={FadeOut.duration(100)}>
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
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.duration(100)} exiting={FadeOut.duration(100)}>
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
          </Animated.View>
        )}
      </View>
    </Modal>
  );
}
