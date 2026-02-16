import React, { useState } from "react";
import { ScrollView } from "react-native";
import { Link } from "expo-router";
import {
  Text, Button, VStack, HStack, Box, Card, CardBody, Badge,
} from "@tuesday-ui/ui";

const properties = [
  { id: 1, price: "$450,000", address: "1234 Oak Avenue, Austin, TX 78701", beds: 3, baths: 2, sqft: "1,850", color: "bg-blue-400", status: "For Sale" },
  { id: 2, price: "$725,000", address: "567 Maple Drive, Denver, CO 80202", beds: 4, baths: 3, sqft: "2,400", color: "bg-emerald-400", status: "New" },
  { id: 3, price: "$1,200,000", address: "89 Pacific Heights Blvd, San Francisco, CA 94115", beds: 5, baths: 4, sqft: "3,200", color: "bg-purple-400", status: "Open House" },
  { id: 4, price: "$329,000", address: "2100 Peachtree St NW, Atlanta, GA 30309", beds: 2, baths: 2, sqft: "1,100", color: "bg-orange-400", status: "Price Cut" },
  { id: 5, price: "$899,000", address: "445 Lakeshore Drive, Chicago, IL 60611", beds: 4, baths: 3, sqft: "2,800", color: "bg-rose-400", status: "For Sale" },
];

export default function PropertyFeed() {
  const [liked, setLiked] = useState<number[]>([]);

  const toggleLike = (id: number) => {
    setLiked((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <VStack className="p-6 max-w-xl mx-auto gap-4">
        <Link href="/showcase" asChild>
          <Button variant="ghost" size="sm">← Back to Showcase</Button>
        </Link>
        <Text className="text-2xl font-semibold text-foreground">Property Feed</Text>

        {properties.map((p) => (
          <Card key={p.id}>
            <Box className={`h-48 ${p.color} rounded-t-xl`} />
            <CardBody>
              <VStack className="gap-2">
                <HStack className="justify-between items-center">
                  <Text className="text-2xl font-bold text-foreground">{p.price}</Text>
                  <Badge variant={p.status === "Price Cut" ? "error" : p.status === "New" ? "success" : "default"}>
                    {p.status}
                  </Badge>
                </HStack>
                <Text className="text-sm text-foreground-muted">{p.address}</Text>
                <HStack className="gap-4 mt-1">
                  <Text className="text-sm text-foreground">{p.beds} beds</Text>
                  <Text className="text-sm text-foreground">{p.baths} baths</Text>
                  <Text className="text-sm text-foreground">{p.sqft} sqft</Text>
                </HStack>
                <HStack className="gap-2 mt-2">
                  <Button variant="ghost" size="sm" onPress={() => toggleLike(p.id)}>
                    {liked.includes(p.id) ? "♥ Saved" : "♡ Save"}
                  </Button>
                  <Button variant="ghost" size="sm">↗ Share</Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </VStack>
    </ScrollView>
  );
}
