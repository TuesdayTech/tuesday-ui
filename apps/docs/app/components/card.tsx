import { PreviewFrame } from "../../components/PreviewFrame";
import React from "react";
import { Link } from "expo-router";
import {
  Text, Button, VStack, Card, CardHeader, CardBody, CardFooter,
} from "@tuesday-ui/ui";

export default function CardPage() {
  return (
    <PreviewFrame>
      <VStack className="p-6 max-w-2xl mx-auto gap-8">
        <Link href="/" asChild>
          <Button variant="ghost" size="sm">← Back</Button>
        </Link>
        <Text className="text-3xl font-semibold text-foreground">Card</Text>

        <Card>
          <CardHeader>
            <Text className="text-lg font-semibold text-foreground">Card Title</Text>
          </CardHeader>
          <CardBody>
            <Text className="text-sm text-foreground-muted">
              This is the card body with some content. Cards are containers for grouping related information.
            </Text>
          </CardBody>
          <CardFooter>
            <Button size="sm" variant="primary">Action</Button>
            <Button size="sm" variant="ghost">Cancel</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardBody>
            <Text className="text-sm text-foreground">Simple card with just a body.</Text>
          </CardBody>
        </Card>
      </VStack>
    </PreviewFrame>
  );
}
