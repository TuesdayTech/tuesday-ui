import React from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, useRouter } from "expo-router";
import { useIsDesktopWeb } from "../../../hooks/useIsDesktopWeb";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { ScreenHeader } from "../../../components/ScreenHeader";
import {
  Lightning,
  Handshake,
  Link as LinkIcon,
  UsersThree,
  Buildings,
} from "phosphor-react-native";

const workSections = [
  { label: "Actions", href: "/work/actions", icon: Lightning },
  { label: "Deals", href: "/work/deals", icon: Handshake },
  { label: "Links", href: "/work/links", icon: LinkIcon },
  { label: "Clients", href: "/work/clients", icon: UsersThree },
  { label: "Team", href: "/work/team", icon: Buildings },
] as const;

export default function WorkIndex() {
  const isDesktopWeb = useIsDesktopWeb();
  const router = useRouter();
  const t = useThemeColors();

  if (isDesktopWeb) return <Redirect href="/work/actions" />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.background }} edges={["top"]}>
      <ScreenHeader title="Work" />
      <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 24 }}>
        {workSections.map((section) => {
          const Icon = section.icon;
          return (
            <Pressable
              key={section.href}
              onPress={() => router.push(section.href as any)}
              className="flex-row items-center py-[18px] active:opacity-50"
            >
              <Icon size={28} color={t.foreground} weight="regular" />
              <Text
                style={{
                  fontFamily: "GeistSans-SemiBold",
                  fontSize: 28,
                  color: t.foreground,
                  marginLeft: 20,
                }}
              >
                {section.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
