/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  // playground-specific config inherits from root preset
  presets: [require("../../packages/tokens/dist/tailwind-preset").tuesdayPreset],
};
