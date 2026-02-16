import { PreviewFrame } from "../../components/PreviewFrame";
import React, { useState } from "react";
import { Link } from "expo-router";
import { Text, SearchBar, Button, VStack } from "@tuesday-ui/ui";

export default function SearchBarPage() {
  const [q, setQ] = useState("");

  return (
    <PreviewFrame>
      <VStack className="p-6 max-w-2xl mx-auto gap-8">
        <Link href="/" asChild>
          <Button variant="ghost" size="sm">← Back</Button>
        </Link>
        <Text className="text-3xl font-semibold text-foreground">SearchBar</Text>

        <VStack className="gap-4">
          <Text className="text-lg font-medium text-foreground">Default</Text>
          <SearchBar value={q} onChangeText={setQ} />
        </VStack>

        <VStack className="gap-4">
          <Text className="text-lg font-medium text-foreground">With Cancel</Text>
          <SearchBar value={q} onChangeText={setQ} showCancel onCancel={() => setQ("")} />
        </VStack>
      </VStack>
    </PreviewFrame>
  );
}
