import React, { useState, createContext, useContext } from "react";
import { View, Text, Pressable } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { useNavMode } from "../hooks/useIsDesktopWeb";
import { useThemeColors } from "../hooks/useThemeColors";
import { fontSize } from "@tuesday-ui/tokens";
import { TuesdayLogo } from "./TuesdayLogo";
import {
  House,
  MagnifyingGlass,
  Lightning,
  Handshake,
  Link as LinkIcon,
  UsersThree,
  Buildings,
  UserCircle,
  List,
  BookmarkSimple,
} from "phosphor-react-native";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

const navItems: NavItem[] = [
  { label: "Feed", href: "/feed", icon: House },
  { label: "Search", href: "/search", icon: MagnifyingGlass },
  { label: "Saved", href: "/saved", icon: BookmarkSimple },
  { label: "Actions", href: "/work/actions", icon: Lightning },
  { label: "Deals", href: "/work/deals", icon: Handshake },
  { label: "Links", href: "/work/links", icon: LinkIcon },
  { label: "Clients", href: "/work/clients", icon: UsersThree },
  { label: "Team", href: "/work/team", icon: Buildings },
];

const bottomItems: NavItem[] = [
  { label: "Profile", href: "/profile", icon: UserCircle },
];

const COLLAPSED_WIDTH = 72;
const EXPANDED_WIDTH = 220;
export const TOP_BAR_HEIGHT = 56;

// Context to pass expanded state down without prop drilling
export const NavExpandedCtx = createContext(true);

// Context to pass theme colors to child components
export const NavThemeCtx = createContext<ReturnType<typeof useThemeColors> | null>(null);

/** Animated label — fades and slides in when sidebar expands */
function NavLabel({ children, bold }: { children: string; bold: boolean }) {
  const expanded = useContext(NavExpandedCtx);
  const t = useContext(NavThemeCtx)!;

  return (
    <Text
      numberOfLines={1}
      style={{
        fontFamily: "GeistMono",
        fontSize: parseInt(fontSize.body[0]),
        color: t.foreground,
        opacity: expanded ? 1 : 0,
        transform: [{ translateX: expanded ? 0 : -8 }],
        transitionProperty: "opacity, transform",
        transitionDuration: expanded ? "150ms" : "100ms",
        transitionDelay: expanded ? "80ms" : "0ms",
        transitionTimingFunction: "ease-out",
      } as any}
    >
      {children}
    </Text>
  );
}

function NavItemRow({
  item,
  isActive,
  onPress,
}: {
  item: NavItem;
  isActive: boolean;
  onPress: () => void;
}) {
  const Icon = item.icon;
  const [hovered, setHovered] = useState(false);
  const t = useContext(NavThemeCtx)!;

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 20,
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderRadius: 8,
        backgroundColor: hovered ? t.hoverOverlay : "transparent",
      }}
    >
      <View style={{ width: 30, height: 30, flexShrink: 0 }}>
        <Icon
          size={30}
          color={t.foreground}
          weight={isActive ? "fill" : "regular"}
        />
      </View>
      <NavLabel bold={isActive}>{item.label}</NavLabel>
    </Pressable>
  );
}

function NavGroup({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <View style={{ gap: 4, paddingHorizontal: 8 }}>
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");

        return (
          <NavItemRow
            key={item.href}
            item={item}
            isActive={isActive}
            onPress={() => router.replace(item.href as any)}
          />
        );
      })}
    </View>
  );
}

function MoreButton() {
  const [hovered, setHovered] = useState(false);
  const t = useContext(NavThemeCtx)!;

  return (
    <View style={{ paddingHorizontal: 8 }}>
      <Pressable
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 20,
          paddingVertical: 14,
          paddingHorizontal: 14,
          borderRadius: 8,
          backgroundColor: hovered ? t.hoverOverlay : "transparent",
        }}
      >
        <View style={{ width: 30, height: 30, flexShrink: 0 }}>
          <List size={30} color={t.foreground} weight="regular" />
        </View>
        <NavLabel bold={false}>More</NavLabel>
      </Pressable>
    </View>
  );
}

function NavContent() {
  const t = useContext(NavThemeCtx)!;

  return (
    <View
      style={{
        width: EXPANDED_WIDTH,
        flex: 1,
        paddingBottom: 20,
      }}
    >
      {/* Logo row — centered, matching ScreenHeader height */}
      <View
        style={{
          height: TOP_BAR_HEIGHT,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 24,
          borderBottomWidth: 1,
          borderBottomColor: t.borderSecondary,
        }}
      >
        <TuesdayLogo />
      </View>

      <View style={{ flex: 1, justifyContent: "center", paddingTop: 8 }}>
        <NavGroup items={navItems} />
      </View>

      <View>
        <MoreButton />
        <NavGroup items={bottomItems} />
      </View>
    </View>
  );
}

export function SideNav({ children }: { children: React.ReactNode }) {
  const navMode = useNavMode();
  const collapsed = navMode === "collapsed";
  const [hovered, setHovered] = useState(false);
  const t = useThemeColors();

  // Expanded mode (wide screen): normal flow layout
  if (!collapsed) {
    return (
      <NavThemeCtx.Provider value={t}>
        <NavExpandedCtx.Provider value={true}>
          <View style={{ flex: 1, flexDirection: "row", backgroundColor: t.background }}>
            <View
              style={{
                width: EXPANDED_WIDTH,
                backgroundColor: t.background,
                borderRightWidth: 1,
                borderRightColor: t.borderSecondary,
              }}
            >
              <NavContent />
            </View>
            <View style={{ flex: 1 }}>{children}</View>
          </View>
        </NavExpandedCtx.Provider>
      </NavThemeCtx.Provider>
    );
  }

  // Collapsed mode: fixed 72px spacer, sidebar overlays on hover
  const expanded = hovered;

  return (
    <NavThemeCtx.Provider value={t}>
      <NavExpandedCtx.Provider value={expanded}>
        <View style={{ flex: 1, flexDirection: "row", backgroundColor: t.background }}>
          {/* Fixed spacer — content always starts here */}
          <View style={{ width: COLLAPSED_WIDTH }} />

          {/* Sidebar — absolutely positioned, overlays content on hover */}
          <View
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
              backgroundColor: t.background,
              borderRightWidth: 1,
              borderRightColor: t.borderSecondary,
              overflow: "hidden",
              zIndex: 10,
              transitionProperty: "width",
              transitionDuration: "200ms",
              transitionTimingFunction: "ease-out",
            } as any}
          >
            <NavContent />
          </View>

          {/* Content — never moves */}
          <View style={{ flex: 1 }}>{children}</View>
        </View>
      </NavExpandedCtx.Provider>
    </NavThemeCtx.Provider>
  );
}
