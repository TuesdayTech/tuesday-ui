import React from "react";
import { View, Text, Pressable, Modal, Linking, ScrollView } from "react-native";
import {
  Link as LinkIcon,
  InstagramLogo,
  FacebookLogo,
  YoutubeLogo,
  TwitterLogo,
  TiktokLogo,
  LinkedinLogo,
  PinterestLogo,
  RedditLogo,
  TelegramLogo,
  SnapchatLogo,
  X,
} from "phosphor-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "../../hooks/useThemeColors";
import {
  cleanUrl,
  detectSocialPlatform,
  sortSocialLinks,
  type SocialPlatform,
} from "../../lib/profile/utils";

interface SocialLinksSheetProps {
  visible: boolean;
  links: string[];
  onClose: () => void;
}

function getPlatformIcon(platform: SocialPlatform, color: string) {
  const size = 18;
  switch (platform) {
    case "instagram":
      return <InstagramLogo size={size} color={color} weight="fill" />;
    case "facebook":
      return <FacebookLogo size={size} color={color} weight="fill" />;
    case "youtube":
      return <YoutubeLogo size={size} color={color} weight="fill" />;
    case "twitter":
      return <TwitterLogo size={size} color={color} weight="fill" />;
    case "tiktok":
      return <TiktokLogo size={size} color={color} weight="fill" />;
    case "linkedin":
      return <LinkedinLogo size={size} color={color} weight="fill" />;
    case "pinterest":
      return <PinterestLogo size={size} color={color} weight="fill" />;
    case "reddit":
      return <RedditLogo size={size} color={color} weight="fill" />;
    case "telegram":
      return <TelegramLogo size={size} color={color} weight="fill" />;
    case "snapchat":
      return <SnapchatLogo size={size} color={color} weight="fill" />;
    default:
      return <LinkIcon size={size} color={color} weight="bold" />;
  }
}

export function SocialLinksSheet({ visible, links, onClose }: SocialLinksSheetProps) {
  const t = useThemeColors();
  const insets = useSafeAreaInsets();
  const accent = "#0A84FF";
  const sorted = sortSocialLinks(links);

  const handleLinkPress = (url: string) => {
    const fullUrl = url.startsWith("http") ? url : `https://${url}`;
    Linking.openURL(fullUrl);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}
      />
      <View
        style={{
          backgroundColor: t.backgroundSecondary,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          paddingBottom: insets.bottom + 16,
          maxHeight: "60%",
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

        <ScrollView style={{ paddingHorizontal: 16 }}>
          {sorted.map((url, index) => {
            const platform = detectSocialPlatform(url);
            return (
              <Pressable
                key={`${url}-${index}`}
                onPress={() => handleLinkPress(url)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingVertical: 10,
                }}
              >
                {getPlatformIcon(platform, accent)}
                <Text
                  numberOfLines={1}
                  style={{
                    fontFamily: "GeistSans-Medium",
                    fontSize: 16,
                    color: t.foreground,
                    flex: 1,
                  }}
                >
                  {cleanUrl(url)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}
