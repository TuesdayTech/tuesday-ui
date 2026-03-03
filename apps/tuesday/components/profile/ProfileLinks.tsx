import React from "react";
import { View, Text, Pressable, Linking, Alert, Platform } from "react-native";
import { Link as LinkIcon } from "phosphor-react-native";
import { useThemeColors } from "../../hooks/useThemeColors";
import {
  formatPhoneNumber,
  getPhoneUri,
  cleanUrl,
  sortSocialLinks,
} from "../../lib/profile/utils";

interface ProfileLinksProps {
  phone?: number;
  email?: string;
  socialLinks?: string[];
  isLoading?: boolean;
  isNonAgent?: boolean;
  onSocialLinksTap?: () => void;
}

export function ProfileLinks({
  phone,
  email,
  socialLinks,
  isLoading,
  isNonAgent,
  onSocialLinksTap,
}: ProfileLinksProps) {
  const t = useThemeColors();
  const textColor = isNonAgent ? "#FFFFFF" : t.foreground;
  const linkColor = "#0A84FF";

  const handlePhoneTap = () => {
    if (!phone) return;
    const formatted = formatPhoneNumber(phone);

    if (Platform.OS === "web") {
      Linking.openURL(getPhoneUri(phone));
      return;
    }

    Alert.alert(formatted, undefined, [
      {
        text: `Call ${formatted}`,
        onPress: () => Linking.openURL(getPhoneUri(phone)),
      },
      {
        text: `Text ${formatted}`,
        onPress: () => Linking.openURL(`sms:${String(phone)}`),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleEmailTap = () => {
    if (!email) return;
    Linking.openURL(`mailto:${email}`);
  };

  if (isLoading) {
    return (
      <View style={{ paddingHorizontal: 12, paddingTop: 8, gap: 6 }}>
        <View
          style={{
            height: 16,
            width: 120,
            borderRadius: 4,
            backgroundColor: t.backgroundTertiary,
          }}
        />
        <View
          style={{
            height: 16,
            width: 160,
            borderRadius: 4,
            backgroundColor: t.backgroundTertiary,
          }}
        />
      </View>
    );
  }

  const hasAnyLink = phone || email || (socialLinks && socialLinks.length > 0);
  if (!hasAnyLink) return null;

  const sorted = socialLinks ? sortSocialLinks(socialLinks) : [];
  const primaryLink = sorted[0];
  const moreCount = sorted.length - 1;

  return (
    <View style={{ paddingHorizontal: 12, paddingTop: 8, gap: 4 }}>
      {phone ? (
        <Pressable onPress={handlePhoneTap}>
          <Text
            style={{
              fontFamily: "GeistSans-Medium",
              fontSize: 15,
              color: textColor,
              textDecorationLine: "underline",
            }}
          >
            {formatPhoneNumber(phone)}
          </Text>
        </Pressable>
      ) : null}

      {email ? (
        <Pressable onPress={handleEmailTap}>
          <Text
            style={{
              fontFamily: "GeistSans-Medium",
              fontSize: 15,
              color: textColor,
              textDecorationLine: "underline",
            }}
          >
            {email}
          </Text>
        </Pressable>
      ) : null}

      {primaryLink ? (
        <Pressable
          onPress={onSocialLinksTap}
          style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}
        >
          <LinkIcon size={16} color={linkColor} weight="bold" />
          <Text
            numberOfLines={1}
            style={{
              fontFamily: "GeistSans-SemiBold",
              fontSize: 15,
              color: linkColor,
            }}
          >
            {cleanUrl(primaryLink)}
            {moreCount > 0 ? ` and ${moreCount} more` : ""}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
