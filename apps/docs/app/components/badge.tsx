import { PreviewFrame } from "../../components/PreviewFrame";
import React from "react";
import { Link } from "expo-router";
import { Text, Badge, Button, VStack, HStack } from "@tuesday-ui/ui";

export default function BadgePage() {
  return (
    <PreviewFrame>
      <VStack className="p-6 max-w-2xl mx-auto gap-8">
        <Link href="/" asChild>
          <Button variant="ghost" size="sm">← Back</Button>
        </Link>
        <Text className="text-3xl font-semibold text-foreground">Badge</Text>

        <VStack className="gap-4">
          <Text className="text-lg font-medium text-foreground">Colors</Text>
          <HStack className="flex-wrap gap-2">
            <Badge color="default">Default</Badge>
            <Badge color="success">Success</Badge>
            <Badge color="warning">Warning</Badge>
            <Badge color="error">Error</Badge>
            <Badge color="info">Info</Badge>
          </HStack>
        </VStack>

        <VStack className="gap-4">
          <Text className="text-lg font-medium text-foreground">Sizes</Text>
          <HStack className="items-center gap-2">
            <Badge size="sm">Small</Badge>
            <Badge size="md">Medium</Badge>
          </HStack>
        </VStack>
      </VStack>
    </PreviewFrame>
  );
}
