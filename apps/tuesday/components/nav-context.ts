import { createContext } from "react";
import type { useThemeColors } from "../hooks/useThemeColors";

/** Whether the side nav is expanded (true) or collapsed (false) */
export const NavExpandedCtx = createContext(true);

/** Theme colors passed down through the nav tree */
export const NavThemeCtx = createContext<ReturnType<typeof useThemeColors> | null>(null);

export const TOP_BAR_HEIGHT = 56;
