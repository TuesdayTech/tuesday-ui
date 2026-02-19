import { Platform, useWindowDimensions } from "react-native";

const DESKTOP_BREAKPOINT = 768;
const WIDE_BREAKPOINT = 1264;

export function useIsDesktopWeb(): boolean {
  const { width } = useWindowDimensions();
  return Platform.OS === "web" && width >= DESKTOP_BREAKPOINT;
}

export function useNavMode(): "mobile" | "collapsed" | "expanded" {
  const { width } = useWindowDimensions();
  if (Platform.OS !== "web" || width < DESKTOP_BREAKPOINT) return "mobile";
  if (width < WIDE_BREAKPOINT) return "collapsed";
  return "expanded";
}
