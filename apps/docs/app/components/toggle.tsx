import React, { useState } from "react";
import { ScrollView } from "react-native";
import { Link } from "expo-router";
import { Text, Toggle, Button, VStack, HStack } from "@tuesday-ui/ui";

export default function TogglePage() {
  const [v1, setV1] = useState(false);
  const [v2, setV2] = useState(true);

  return (
    <ScrollView className="flex-1 bg-background">
      <VStack className="p-6 max-w-2xl mx-auto gap-8">
        <Link href="/" asChild>
          <Button variant="ghost" size="sm">← Back</Button>
        </Link>
        <Text className="text-3xl font-semibold text-foreground">Toggle / Switch</Text>

        <VStack className="gap-6">
          <HStack className="items-center gap-3">
            <Toggle value={v1} onValueChange={setV1} />
            <Text className="text-foreground">{v1 ? "On" : "Off"}</Text>
          </HStack>
          <HStack className="items-center gap-3">
            <Toggle value={v2} onValueChange={setV2} />
            <Text className="text-foreground">{v2 ? "On" : "Off"}</Text>
          </HStack>
          <HStack className="items-center gap-3">
            <Toggle disabled />
            <Text className="text-foreground-muted">Disabled</Text>
          </HStack>
        </VStack>
      </VStack>
    </ScrollView>
  );
}
