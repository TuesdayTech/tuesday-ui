import React, { useState } from "react";
import { ScrollView } from "react-native";
import { Link } from "expo-router";
import {
  Text, TextField, Button, VStack, Box, Checkbox, Divider,
} from "@tuesday-ui/ui";

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  return (
    <ScrollView className="flex-1 bg-background">
      <VStack className="p-6 max-w-sm mx-auto gap-6 pt-20">
        <Link href="/" asChild>
          <Button variant="ghost" size="sm">← Back to docs</Button>
        </Link>

        <VStack className="items-center gap-2 mb-4">
          <Text className="text-3xl font-semibold text-foreground">Welcome back</Text>
          <Text className="text-sm text-foreground-muted">Sign in to your account</Text>
        </VStack>

        <VStack className="gap-4">
          <TextField
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextField
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Checkbox
            label="Remember me"
            checked={remember}
            onValueChange={setRemember}
          />
          <Button variant="primary" size="lg">Sign In</Button>
        </VStack>

        <Divider />

        <VStack className="items-center gap-3">
          <Button variant="outline" className="w-full">Continue with Google</Button>
          <Button variant="outline" className="w-full">Continue with Apple</Button>
        </VStack>

        <Text className="text-xs text-foreground-muted text-center mt-4">
          Don't have an account? <Text className="text-accent">Sign Up</Text>
        </Text>
      </VStack>
    </ScrollView>
  );
}
