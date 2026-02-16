import React, { useState } from "react";
import { ScrollView } from "react-native";
import { Link } from "expo-router";
import {
  Text, Button, VStack, HStack, Box, SearchBar, Chip, ListItem, Badge,
} from "@tuesday-ui/ui";

const allProperties = [
  { id: 1, price: "$450,000", address: "1234 Oak Avenue, Austin, TX", type: "Buy", beds: 3, status: "Active" },
  { id: 2, price: "$2,800/mo", address: "567 Maple Drive, Denver, CO", type: "Rent", beds: 2, status: "Active" },
  { id: 3, price: "$725,000", address: "89 Pacific Heights, San Francisco, CA", type: "Buy", beds: 4, status: "Pending" },
  { id: 4, price: "$1,500/mo", address: "2100 Peachtree St, Atlanta, GA", type: "Rent", beds: 1, status: "Active" },
  { id: 5, price: "$680,000", address: "445 Lakeshore Dr, Chicago, IL", type: "Sold", beds: 3, status: "Sold" },
  { id: 6, price: "$329,000", address: "78 Elm Street, Portland, OR", type: "Buy", beds: 2, status: "Active" },
];

const typeFilters = ["All", "Buy", "Rent", "Sold"];
const bedFilters = ["Any", "1+", "2+", "3+", "4+"];

export default function PropertySearch() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [bedFilter, setBedFilter] = useState("Any");

  const filtered = allProperties.filter((p) => {
    if (typeFilter !== "All" && p.type !== typeFilter) return false;
    if (bedFilter !== "Any" && p.beds < parseInt(bedFilter)) return false;
    if (query && !p.address.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <ScrollView className="flex-1 bg-background">
      <VStack className="p-6 max-w-xl mx-auto gap-4">
        <Link href="/showcase" asChild>
          <Button variant="ghost" size="sm">← Back to Showcase</Button>
        </Link>
        <Text className="text-2xl font-semibold text-foreground">Property Search</Text>

        <SearchBar placeholder="Search by location..." value={query} onChangeText={setQuery} />

        <VStack className="gap-2">
          <Text className="text-sm font-medium text-foreground-muted">Type</Text>
          <HStack className="gap-2 flex-wrap">
            {typeFilters.map((f) => (
              <Chip key={f} selected={typeFilter === f} onPress={() => setTypeFilter(f)}>
                {f}
              </Chip>
            ))}
          </HStack>
        </VStack>

        <VStack className="gap-2">
          <Text className="text-sm font-medium text-foreground-muted">Bedrooms</Text>
          <HStack className="gap-2 flex-wrap">
            {bedFilters.map((f) => (
              <Chip key={f} selected={bedFilter === f} onPress={() => setBedFilter(f)}>
                {f}
              </Chip>
            ))}
          </HStack>
        </VStack>

        <Text className="text-sm text-foreground-muted">{filtered.length} results</Text>

        <VStack className="gap-1">
          {filtered.map((p) => (
            <ListItem
              key={p.id}
              title={p.price}
              subtitle={p.address}
              trailing={
                <Badge variant={p.status === "Sold" ? "error" : p.status === "Pending" ? "warning" : "success"}>
                  {p.status}
                </Badge>
              }
            />
          ))}
        </VStack>
      </VStack>
    </ScrollView>
  );
}
