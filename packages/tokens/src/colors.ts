export const gray = {
  50: { DEFAULT: '#0A0A0A', light: '#FAFAFA' },
  100: { DEFAULT: '#141414', light: '#F5F5F5' },
  200: { DEFAULT: '#1F1F1F', light: '#E5E5E5' },
  300: { DEFAULT: '#292929', light: '#D4D4D4' },
  400: { DEFAULT: '#3D3D3D', light: '#A3A3A3' },
  500: { DEFAULT: '#525252', light: '#737373' },
  600: { DEFAULT: '#737373', light: '#525252' },
  700: { DEFAULT: '#A3A3A3', light: '#3D3D3D' },
  800: { DEFAULT: '#D4D4D4', light: '#292929' },
  900: { DEFAULT: '#EDEDED', light: '#171717' },
} as const;

export const colors = {
  background: {
    DEFAULT: '#000000',
    light: '#FFFFFF',
    secondary: { DEFAULT: '#111111', light: '#FAFAFA' },
    tertiary: { DEFAULT: '#1A1A1A', light: '#F5F5F5' },
  },
  foreground: {
    DEFAULT: '#EDEDED',
    light: '#171717',
    muted: { DEFAULT: '#A1A1A1', light: '#666666' },
    subtle: { DEFAULT: '#707070', light: '#999999' },
  },
  accent: {
    DEFAULT: '#0A84FF',
  },
  success: { DEFAULT: '#2EA043' },
  error: { DEFAULT: '#E5484D' },
  warning: { DEFAULT: '#F5A623' },
  info: { DEFAULT: '#0070F3' },
  border: {
    DEFAULT: '#333333',
    light: '#EAEAEA',
    secondary: { DEFAULT: '#222222', light: '#F0F0F0' },
  },
  gray,
} as const;
