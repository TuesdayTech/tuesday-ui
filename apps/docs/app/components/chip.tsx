import React, { useState } from "react";
import { ScrollView } from "react-native";
import { Link } from "expo-router";
import { Text, Chip, Button, VStack, HStack } from "@tuesday-ui/ui";

export default function ChipPage() {
  const [selected, setSelected] = useState<string[]>(["react"]);

  const toggle = (val: string) =>
    setSelected((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );

  return (
    <ScrollView className="flex-1 bg-background">
      <VStack className="p-6 max-w-2xl mx-auto gap-8">
        <Link href="/" asChild>
          <Button variant="ghost" size="sm">← Back</Button>
        </Link>
        <Text className="text-3xl font-semibold text-foreground">Chip / Tag</Text>

        <VStack className="gap-4">
          <Text className="text-lg font-medium text-foreground">Selectable</Text>
          <HStack className="flex-wrap gap-2">
            {["react", "typescript", "expo", "nativewind"].map((tag) => (
              <Chip
                key={tag}
                label={tag}
                selected={selected.includes(tag)}
                onPress={() => toggle(tag)}
              />
            ))}
          </HStack>
        </VStack>

        <VStack className="gap-4">
          <Text className="text-lg font-medium text-foreground">Deletable</Text>
          <HStack className="flex-wrap gap-2">
            <Chip label="Remove me" deletable onDelete={() => {}} />
            <Chip label="Selected" selected deletable onDelete={() => {}} />
          </HStack>
        </VStack>
      </VStack>
    </ScrollView>
  );
}
