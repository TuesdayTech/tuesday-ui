import React from "react";
import { ScrollView } from "react-native";
import { Link } from "expo-router";
import { Text, Avatar, Button, VStack, HStack } from "@tuesday-ui/ui";

export default function AvatarPage() {
  return (
    <ScrollView className="flex-1 bg-background">
      <VStack className="p-6 max-w-2xl mx-auto gap-8">
        <Link href="/" asChild>
          <Button variant="ghost" size="sm">← Back</Button>
        </Link>
        <Text className="text-3xl font-semibold text-foreground">Avatar</Text>

        <VStack className="gap-4">
          <Text className="text-lg font-medium text-foreground">Sizes</Text>
          <HStack className="items-center gap-3">
            <Avatar size="sm" initials="S" />
            <Avatar size="md" initials="M" />
            <Avatar size="lg" initials="L" />
            <Avatar size="xl" initials="XL" />
          </HStack>
        </VStack>

        <VStack className="gap-4">
          <Text className="text-lg font-medium text-foreground">Initials</Text>
          <HStack className="gap-3">
            <Avatar initials="AB" />
            <Avatar initials="CD" />
            <Avatar initials="EF" />
          </HStack>
        </VStack>

        <VStack className="gap-4">
          <Text className="text-lg font-medium text-foreground">Fallback</Text>
          <HStack className="gap-3">
            <Avatar />
            <Avatar fallback={<Text className="text-xl">👤</Text>} />
          </HStack>
        </VStack>
      </VStack>
    </ScrollView>
  );
}
