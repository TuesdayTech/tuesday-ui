import { PreviewFrame } from "../../components/PreviewFrame";
import React from "react";
import { Link } from "expo-router";
import { Text, TextField, FormGroup, Button, VStack } from "@tuesday-ui/ui";

export default function FormGroupPage() {
  return (
    <PreviewFrame>
      <VStack className="p-6 max-w-2xl mx-auto gap-8">
        <Link href="/" asChild>
          <Button variant="ghost" size="sm">← Back</Button>
        </Link>
        <Text className="text-3xl font-semibold text-foreground">FormGroup</Text>

        <FormGroup label="Username" helperText="Choose a unique username">
          <TextField placeholder="johndoe" />
        </FormGroup>

        <FormGroup label="Email" error="Email is required">
          <TextField placeholder="you@example.com" />
        </FormGroup>
      </VStack>
    </PreviewFrame>
  );
}
