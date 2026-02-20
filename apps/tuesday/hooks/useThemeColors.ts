import { useColorScheme } from "react-native";
import { colors } from "@tuesday-ui/tokens";

export function useThemeColors() {
  const scheme = useColorScheme();
  const dark = scheme === "dark";

  return {
    background: dark ? colors.background.DEFAULT : colors.background.light,
    backgroundSecondary: dark
      ? colors.background.secondary.DEFAULT
      : colors.background.secondary.light,
    backgroundTertiary: dark
      ? colors.background.tertiary.DEFAULT
      : colors.background.tertiary.light,
    foreground: dark ? colors.foreground.DEFAULT : colors.foreground.light,
    foregroundMuted: dark
      ? colors.foreground.muted.DEFAULT
      : colors.foreground.muted.light,
    foregroundSubtle: dark
      ? colors.foreground.subtle.DEFAULT
      : colors.foreground.subtle.light,
    border: dark ? colors.border.DEFAULT : colors.border.light,
    borderSecondary: dark
      ? colors.border.secondary.DEFAULT
      : colors.border.secondary.light,
    hoverOverlay: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
  };
}
