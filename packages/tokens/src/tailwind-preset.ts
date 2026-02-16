import { colors } from './colors';
import { spacing } from './spacing';
import { radii } from './radii';
import { fontFamily, fontSize } from './typography';

// Flatten colors for Tailwind dark-first approach
const tailwindColors = {
  background: {
    DEFAULT: colors.background.DEFAULT,
    secondary: colors.background.secondary.DEFAULT,
    tertiary: colors.background.tertiary.DEFAULT,
  },
  foreground: {
    DEFAULT: colors.foreground.DEFAULT,
    muted: colors.foreground.muted.DEFAULT,
    subtle: colors.foreground.subtle.DEFAULT,
  },
  accent: colors.accent.DEFAULT,
  success: colors.success.DEFAULT,
  error: colors.error.DEFAULT,
  warning: colors.warning.DEFAULT,
  info: colors.info.DEFAULT,
  border: {
    DEFAULT: colors.border.DEFAULT,
    secondary: colors.border.secondary.DEFAULT,
  },
  // Light mode overrides via CSS vars handled by ThemeProvider
  light: {
    background: {
      DEFAULT: colors.background.light,
      secondary: colors.background.secondary.light,
      tertiary: colors.background.tertiary.light,
    },
    foreground: {
      DEFAULT: colors.foreground.light,
      muted: colors.foreground.muted.light,
      subtle: colors.foreground.subtle.light,
    },
    border: {
      DEFAULT: colors.border.light,
      secondary: colors.border.secondary.light,
    },
  },
};

export const tuesdayPreset = {
  content: [] as string[],
  theme: {
    extend: {
      colors: tailwindColors,
      spacing,
      borderRadius: radii,
      fontFamily: {
        sans: fontFamily.sans,
        mono: fontFamily.mono,
      },
      fontSize,
    },
  },
} as const;

export default tuesdayPreset;
