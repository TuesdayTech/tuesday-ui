import React, { useState } from "react";
import { ScrollView } from "react-native";
import { Link } from "expo-router";
import {
  Text, Button, VStack, SearchBar, Chip, ListItem, Avatar, Badge, Divider, Header, HStack,
} from "@tuesday-ui/ui";

const items = [
  { id: "1", name: "Alice Johnson", role: "Designer", status: "online" },
  { id: "2", name: "Bob Smith", role: "Developer", status: "away" },
  { id: "3", name: "Carol White", role: "PM", status: "offline" },
  { id: "4", name: "Dave Brown", role: "Developer", status: "online" },
  { id: "5", name: "Eve Davis", role: "Designer", status: "online" },
];

const filters = ["All", "Designers", "Developers", "PMs"];

export default function ListScreen() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = items.filter((i) => {
    const matchQuery = i.name.toLowerCase().includes(query.toLowerCase());
    const matchFilter =
      activeFilter === "All" ||
      (activeFilter === "Designers" && i.role === "Designer") ||
      (activeFilter === "Developers" && i.role === "Developer") ||
      (activeFilter === "PMs" && i.role === "PM");
    return matchQuery && matchFilter;
  });

  return (
    <VStack className="flex-1 bg-background">
      <Header
        title="Team"
        showBack
        actions={
          <Link href="/" asChild>
            <Button variant="ghost" size="sm">Docs</Button>
          </Link>
        }
      />

      <SearchBar value={query} onChangeText={setQuery} className="py-3" />

      <HStack className="px-4 gap-2 pb-3">
        {filters.map((f) => (
          <Chip
            key={f}
            label={f}
            selected={activeFilter === f}
            onPress={() => setActiveFilter(f)}
          />
        ))}
      </HStack>

      <ScrollView className="flex-1">
        {filtered.map((item, i) => (
          <React.Fragment key={item.id}>
            {i > 0 && <Divider />}
            <ListItem
              title={item.name}
              subtitle={item.role}
              leading={<Avatar size="sm" initials={item.name.slice(0, 2)} />}
              trailing={
                <Badge
                  size="sm"
                  color={item.status === "online" ? "success" : item.status === "away" ? "warning" : "default"}
                >
                  {item.status}
                </Badge>
              }
            />
          </React.Fragment>
        ))}
      </ScrollView>
    </VStack>
  );
}
