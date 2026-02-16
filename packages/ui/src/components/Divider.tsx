import React from "react";
import { cn } from "@tuesday-ui/utils";
import { Box } from "../primitives/Box";

export interface DividerProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export function Divider({
  className,
  orientation = "horizontal",
}: DividerProps) {
  return (
    <Box
      className={cn(
        "bg-border",
        orientation === "horizontal" ? "h-px w-full" : "w-px h-full",
        className
      )}
    />
  );
}
