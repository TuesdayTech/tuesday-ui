/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  presets: [
    require("nativewind/preset"),
    require("../../packages/tokens/dist/tailwind-preset").tuesdayPreset,
  ],
};
