import React from "react";
import { TextInput } from "react-native";
import { cn } from "@tuesday-ui/utils";
import { Pressable } from "../primitives/Pressable";
import { Box } from "../primitives/Box";
import { Text } from "../primitives/Text";

export interface SearchBarProps {
  className?: string;
  value?: string;
  placeholder?: string;
  onChangeText?: (text: string) => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

export function SearchBar({
  className,
  value = "",
  placeholder = "Search...",
  onChangeText,
  onCancel,
  showCancel = false,
}: SearchBarProps) {
  return (
    <Box className={cn("flex-row items-center gap-2 px-4", className)}>
      <Box className="flex-1 flex-row items-center rounded-lg bg-background-tertiary px-3 h-10">
        <Text className="text-foreground-muted mr-2">🔍</Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#707070"
          className="flex-1 text-foreground text-sm"
        />
        {value.length > 0 && (
          <Pressable onPress={() => onChangeText?.("")}>
            <Text className="text-foreground-muted text-xs">✕</Text>
          </Pressable>
        )}
      </Box>
      {showCancel && (
        <Pressable onPress={onCancel}>
          <Text className="text-accent text-sm">Cancel</Text>
        </Pressable>
      )}
    </Box>
  );
}
