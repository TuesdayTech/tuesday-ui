import React, { useState } from "react";
import { ScrollView } from "react-native";
import { Link } from "expo-router";
import { Text, TextField, Button, VStack } from "@tuesday-ui/ui";

export default function TextFieldPage() {
  const [val, setVal] = useState("");
  return (
    <ScrollView className="flex-1 bg-background">
      <VStack className="p-6 max-w-2xl mx-auto gap-8">
        <Link href="/" asChild>
          <Button variant="ghost" size="sm">← Back</Button>
        </Link>
        <Text className="text-3xl font-semibold text-foreground">TextField</Text>

        <VStack className="gap-4">
          <Text className="text-lg font-medium text-foreground">Default</Text>
          <TextField placeholder="Enter text..." value={val} onChangeText={setVal} />
        </VStack>

        <VStack className="gap-4">
          <Text className="text-lg font-medium text-foreground">With Label & Helper</Text>
          <TextField label="Email" placeholder="you@example.com" helperText="We'll never share your email." />
        </VStack>

        <VStack className="gap-4">
          <Text className="text-lg font-medium text-foreground">Error</Text>
          <TextField label="Password" placeholder="••••••" error="Password is required" />
        </VStack>

        <VStack className="gap-4">
          <Text className="text-lg font-medium text-foreground">Disabled</Text>
          <TextField label="Disabled" placeholder="Can't edit" disabled />
        </VStack>
      </VStack>
    </ScrollView>
  );
}
