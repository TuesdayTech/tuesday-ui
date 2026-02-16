import type { Config } from 'tailwindcss';
import { tuesdayPreset } from '@tuesday-ui/tokens/tailwind-preset';

const config: Config = {
  darkMode: 'class',
  content: [
    './apps/**/*.{ts,tsx}',
    './packages/ui/src/**/*.{ts,tsx}',
  ],
  presets: [tuesdayPreset as any],
};

export default config;
