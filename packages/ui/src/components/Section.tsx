import React, { useState } from "react";
import { cn } from "@tuesday-ui/utils";
import { Pressable } from "../primitives/Pressable";
import { Box } from "../primitives/Box";
import { Text } from "../primitives/Text";

export interface SectionProps {
  className?: string;
  title?: string;
  subtitle?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  children: React.ReactNode;
}

export function Section({
  className,
  title,
  subtitle,
  collapsible = false,
  defaultCollapsed = false,
  children,
}: SectionProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const header = (title || subtitle) && (
    <Box className="gap-0.5 mb-3">
      {title && (
        <Box className="flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-foreground">{title}</Text>
          {collapsible && (
            <Text className="text-foreground-muted text-sm">
              {collapsed ? "▶" : "▼"}
            </Text>
          )}
        </Box>
      )}
      {subtitle && (
        <Text className="text-sm text-foreground-muted">{subtitle}</Text>
      )}
    </Box>
  );

  return (
    <Box className={cn("py-3", className)}>
      {collapsible ? (
        <Pressable onPress={() => setCollapsed(!collapsed)}>
          {header}
        </Pressable>
      ) : (
        header
      )}
      {!collapsed && children}
    </Box>
  );
}
