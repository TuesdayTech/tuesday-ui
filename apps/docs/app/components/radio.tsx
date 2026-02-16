import { PreviewFrame } from "../../components/PreviewFrame";
import React, { useState } from "react";
import { Link } from "expo-router";
import { Text, Radio, Button, VStack } from "@tuesday-ui/ui";

export default function RadioPage() {
  const [selected, setSelected] = useState("a");

  return (
    <PreviewFrame>
      <VStack className="p-6 max-w-2xl mx-auto gap-8">
        <Link href="/" asChild>
          <Button variant="ghost" size="sm">← Back</Button>
        </Link>
        <Text className="text-3xl font-semibold text-foreground">Radio</Text>

        <VStack className="gap-4">
          <Radio label="Option A" selected={selected === "a"} onPress={() => setSelected("a")} />
          <Radio label="Option B" selected={selected === "b"} onPress={() => setSelected("b")} />
          <Radio label="Option C" selected={selected === "c"} onPress={() => setSelected("c")} />
          <Radio label="Disabled" disabled />
        </VStack>
      </VStack>
    </PreviewFrame>
  );
}
