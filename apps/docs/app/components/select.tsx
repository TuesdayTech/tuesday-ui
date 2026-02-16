import { PreviewFrame } from "../../components/PreviewFrame";
import React, { useState } from "react";
import { Link } from "expo-router";
import { Text, Select, Button, VStack } from "@tuesday-ui/ui";

const options = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
  { label: "Grape", value: "grape" },
];

export default function SelectPage() {
  const [val, setVal] = useState<string | undefined>();

  return (
    <PreviewFrame>
      <VStack className="p-6 max-w-2xl mx-auto gap-8">
        <Link href="/" asChild>
          <Button variant="ghost" size="sm">← Back</Button>
        </Link>
        <Text className="text-3xl font-semibold text-foreground">Select</Text>

        <VStack className="gap-4">
          <Text className="text-lg font-medium text-foreground">Default</Text>
          <Select options={options} value={val} onValueChange={setVal} placeholder="Pick a fruit..." />
        </VStack>

        <VStack className="gap-4">
          <Text className="text-lg font-medium text-foreground">Disabled</Text>
          <Select options={options} disabled placeholder="Can't select" />
        </VStack>
      </VStack>
    </PreviewFrame>
  );
}
