import React from "react";
import { cn } from "@tuesday-ui/utils";
import { Pressable } from "../primitives/Pressable";
import { Box } from "../primitives/Box";
import { Text } from "../primitives/Text";

export interface HeaderProps {
  className?: string;
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
}

export function Header({
  className,
  title,
  showBack = false,
  onBack,
  actions,
}: HeaderProps) {
  return (
    <Box
      className={cn(
        "flex-row items-center px-4 h-14 border-b border-border bg-background",
        className
      )}
    >
      {showBack && (
        <Pressable onPress={onBack} className="mr-3 p-1">
          <Text className="text-accent text-lg">←</Text>
        </Pressable>
      )}
      <Text className="flex-1 text-lg font-semibold text-foreground">
        {title}
      </Text>
      {actions && <Box className="flex-row items-center gap-2">{actions}</Box>}
    </Box>
  );
}
