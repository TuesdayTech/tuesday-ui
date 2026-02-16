import React, { useState } from "react";
import { FlatList, Modal } from "react-native";
import { cn } from "@tuesday-ui/utils";
import { Pressable } from "../primitives/Pressable";
import { Box } from "../primitives/Box";
import { Text } from "../primitives/Text";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  className?: string;
  options: SelectOption[];
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
}

export function Select({
  className,
  options,
  value,
  placeholder = "Select...",
  disabled = false,
  onValueChange,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <>
      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        className={cn(
          "flex-row items-center justify-between rounded-md border border-border bg-background-secondary px-3 h-10",
          disabled && "opacity-50",
          className
        )}
      >
        <Text
          className={cn(
            "text-sm",
            selected ? "text-foreground" : "text-foreground-subtle"
          )}
        >
          {selected?.label ?? placeholder}
        </Text>
        <Text className="text-foreground-muted text-xs">▼</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade">
        <Pressable
          className="flex-1 justify-center items-center bg-black/50"
          onPress={() => setOpen(false)}
        >
          <Box className="bg-background-secondary rounded-lg w-64 max-h-72 border border-border">
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onValueChange?.(item.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "px-4 py-3 border-b border-border",
                    item.value === value && "bg-accent/10"
                  )}
                >
                  <Text
                    className={cn(
                      "text-sm",
                      item.value === value
                        ? "text-accent font-medium"
                        : "text-foreground"
                    )}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              )}
            />
          </Box>
        </Pressable>
      </Modal>
    </>
  );
}
