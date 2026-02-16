import React from "react";
import { ScrollView } from "react-native";
import { Text, Button, VStack } from "@tuesday-ui/ui";

export default function PlaygroundIndex() {
  return (
    <ScrollView className="flex-1 bg-background">
      <VStack className="p-6 gap-4">
        <Text className="text-2xl font-semibold text-foreground">
          tuesday-ui playground
        </Text>
        <Button variant="primary">Primary Button</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
      </VStack>
    </ScrollView>
  );
}
