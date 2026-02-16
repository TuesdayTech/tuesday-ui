import { PreviewFrame } from "../../components/PreviewFrame";
import React from "react";
import { Link } from "expo-router";
import { Text, AlertBanner, Button, VStack } from "@tuesday-ui/ui";

export default function AlertBannerPage() {
  return (
    <PreviewFrame>
      <VStack className="p-6 max-w-2xl mx-auto gap-8">
        <Link href="/" asChild>
          <Button variant="ghost" size="sm">← Back</Button>
        </Link>
        <Text className="text-3xl font-semibold text-foreground">AlertBanner</Text>

        <VStack className="gap-4">
          <AlertBanner variant="info" title="Info" message="This is an informational message." />
          <AlertBanner variant="success" title="Success" message="Operation completed successfully." />
          <AlertBanner variant="warning" title="Warning" message="Please review before continuing." />
          <AlertBanner variant="error" title="Error" message="Something went wrong." />
          <AlertBanner variant="info" message="Dismissable alert" dismissable />
        </VStack>
      </VStack>
    </PreviewFrame>
  );
}
