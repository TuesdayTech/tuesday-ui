import React from "react";
import { ScrollView } from "react-native";
import { Link } from "expo-router";
import { Text, Divider, Button, VStack, HStack, Box } from "@tuesday-ui/ui";

export default function DividerPage() {
  return (
    <ScrollView className="flex-1 bg-background">
      <VStack className="p-6 max-w-2xl mx-auto gap-8">
        <Link href="/" asChild>
          <Button variant="ghost" size="sm">← Back</Button>
        </Link>
        <Text className="text-3xl font-semibold text-foreground">Divider</Text>

        <VStack className="gap-4">
          <Text className="text-lg font-medium text-foreground">Horizontal</Text>
          <Text className="text-foreground">Above</Text>
          <Divider />
          <Text className="text-foreground">Below</Text>
        </VStack>

        <VStack className="gap-4">
          <Text className="text-lg font-medium text-foreground">Vertical</Text>
          <HStack className="items-center gap-3 h-10">
            <Text className="text-foreground">Left</Text>
            <Divider orientation="vertical" />
            <Text className="text-foreground">Right</Text>
          </HStack>
        </VStack>
      </VStack>
    </ScrollView>
  );
}
