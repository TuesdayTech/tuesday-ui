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
} as const;
