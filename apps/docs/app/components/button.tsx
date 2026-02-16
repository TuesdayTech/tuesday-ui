import { PreviewFrame } from "../../components/PreviewFrame";
import React from "react";
import { Link } from "expo-router";
import { Text, Button, VStack, HStack, Box } from "@tuesday-ui/ui";

export default function ButtonPage() {
  return (
    <PreviewFrame>
      <VStack className="p-6 max-w-2xl mx-auto gap-8">
        <Link href="/" asChild>
          <Button variant="ghost" size="sm">← Back</Button>
        </Link>

        <Text className="text-3xl font-semibold text-foreground">Button</Text>

        <VStack className="gap-4">
          <Text className="text-lg font-medium text-foreground">Variants</Text>
          <HStack className="flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </HStack>
        </VStack>

        <VStack className="gap-4">
          <Text className="text-lg font-medium text-foreground">Sizes</Text>
          <HStack className="items-center flex-wrap gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </HStack>
        </VStack>

        <VStack className="gap-4">
          <Text className="text-lg font-medium text-foreground">States</Text>
          <HStack className="flex-wrap gap-3">
            <Button disabled>Disabled</Button>
            <Button loading>Loading</Button>
          </HStack>
        </VStack>
      </VStack>
    </PreviewFrame>
  );
}
