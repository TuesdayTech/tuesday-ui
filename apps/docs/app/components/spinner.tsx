import { PreviewFrame } from "../../components/PreviewFrame";
import React from "react";
import { Link } from "expo-router";
import { Text, Spinner, Button, VStack, HStack } from "@tuesday-ui/ui";

export default function SpinnerPage() {
  return (
    <PreviewFrame>
      <VStack className="p-6 max-w-2xl mx-auto gap-8">
        <Link href="/" asChild>
          <Button variant="ghost" size="sm">← Back</Button>
        </Link>
        <Text className="text-3xl font-semibold text-foreground">Spinner</Text>

        <VStack className="gap-4">
          <Text className="text-lg font-medium text-foreground">Sizes</Text>
          <HStack className="items-center gap-6">
            <VStack className="items-center gap-2">
              <Spinner size="sm" />
              <Text className="text-xs text-foreground-muted">Small</Text>
            </VStack>
            <VStack className="items-center gap-2">
              <Spinner size="md" />
              <Text className="text-xs text-foreground-muted">Medium</Text>
            </VStack>
            <VStack className="items-center gap-2">
              <Spinner size="lg" />
              <Text className="text-xs text-foreground-muted">Large</Text>
            </VStack>
          </HStack>
        </VStack>
      </VStack>
    </PreviewFrame>
  );
}
