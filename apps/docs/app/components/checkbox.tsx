import React, { useState } from "react";
import { ScrollView } from "react-native";
import { Link } from "expo-router";
import { Text, Checkbox, Button, VStack } from "@tuesday-ui/ui";

export default function CheckboxPage() {
  const [c1, setC1] = useState(false);
  const [c2, setC2] = useState(true);

  return (
    <ScrollView className="flex-1 bg-background">
      <VStack className="p-6 max-w-2xl mx-auto gap-8">
        <Link href="/" asChild>
          <Button variant="ghost" size="sm">← Back</Button>
        </Link>
        <Text className="text-3xl font-semibold text-foreground">Checkbox</Text>

        <VStack className="gap-4">
          <Checkbox label="Unchecked" checked={c1} onValueChange={setC1} />
          <Checkbox label="Checked" checked={c2} onValueChange={setC2} />
          <Checkbox label="Indeterminate" indeterminate />
          <Checkbox label="Disabled" disabled />
          <Checkbox label="Disabled Checked" checked disabled />
        </VStack>
      </VStack>
    </ScrollView>
  );
}
