import React from "react";
import { Tabs } from "expo-router";
import { Slot } from "expo-router";
import {
  House,
  MagnifyingGlass,
  BookmarkSimple,
  Briefcase,
  UserCircle,
} from "phosphor-react-native";
import { useIsDesktopWeb } from "../../hooks/useIsDesktopWeb";
import { useThemeColors } from "../../hooks/useThemeColors";
import { SideNav } from "../../components/SideNav";
import { AIFab } from "../../components/AIFab";

export default function TabsLayout() {
  const isDesktopWeb = useIsDesktopWeb();
  const t = useThemeColors();

  if (isDesktopWeb) {
    return (
      <SideNav>
        <Slot />
        <AIFab />
      </SideNav>
    );
  }

  const iconSize = 22;

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: t.background,
            borderTopColor: t.borderSecondary,
            borderTopWidth: 0.5,
            paddingBottom: 4,
          },
          tabBarActiveTintColor: t.foreground,
          tabBarInactiveTintColor: t.foregroundSubtle,
          tabBarLabelStyle: {
            fontFamily: "GeistSans",
            fontSize: 10,
          },
          tabBarIconStyle: {
            marginTop: 4,
          },
        }}
        safeAreaInsets={{ bottom: undefined }}
      >
        <Tabs.Screen
          name="feed"
          options={{
            title: "Feed",
            tabBarIcon: ({ color, focused }) => (
              <House size={iconSize} color={color} weight={focused ? "fill" : "bold"} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Search",
            tabBarIcon: ({ color, focused }) => (
              <MagnifyingGlass size={iconSize} color={color} weight={focused ? "fill" : "bold"} />
            ),
          }}
        />
        <Tabs.Screen
          name="saved"
          options={{
            title: "Saved",
            tabBarIcon: ({ color, focused }) => (
              <BookmarkSimple size={iconSize} color={color} weight={focused ? "fill" : "bold"} />
            ),
          }}
        />
        <Tabs.Screen
          name="work"
          options={{
            title: "Work",
            tabBarIcon: ({ color, focused }) => (
              <Briefcase size={iconSize} color={color} weight={focused ? "fill" : "bold"} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <UserCircle size={iconSize} color={color} weight={focused ? "fill" : "bold"} />
            ),
          }}
        />
        {/* AI is a FAB, not a tab */}
        <Tabs.Screen
          name="ai"
          options={{ href: null }}
        />
      </Tabs>
      <AIFab />
    </>
  );
}
