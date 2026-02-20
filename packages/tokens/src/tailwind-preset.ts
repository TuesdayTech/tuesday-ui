import { spacing } from './spacing';
import { radii } from './radii';
import { fontFamily, fontWeight, fontSize } from './typography';

const tailwindColors = {
  background: {
    DEFAULT: 'var(--color-background)',
    secondary: 'var(--color-background-secondary)',
    tertiary: 'var(--color-background-tertiary)',
  },
  foreground: {
    DEFAULT: 'var(--color-foreground)',
    muted: 'var(--color-foreground-muted)',
    subtle: 'var(--color-foreground-subtle)',
  },
  accent: 'var(--color-accent)',
  success: 'var(--color-success)',
  error: 'var(--color-error)',
  warning: 'var(--color-warning)',
  info: 'var(--color-info)',
  border: {
    DEFAULT: 'var(--color-border)',
    secondary: 'var(--color-border-secondary)',
  },
  gray: {
    50: 'var(--color-gray-50)',
    100: 'var(--color-gray-100)',
    200: 'var(--color-gray-200)',
    300: 'var(--color-gray-300)',
    400: 'var(--color-gray-400)',
    500: 'var(--color-gray-500)',
    600: 'var(--color-gray-600)',
    700: 'var(--color-gray-700)',
    800: 'var(--color-gray-800)',
    900: 'var(--color-gray-900)',
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
      fontWeight,
      fontSize,
    },
  },
};

export default tuesdayPreset;
