import React from "react";
import { ScrollView } from "react-native";
import { Link } from "expo-router";
import {
  Text, Button, VStack, HStack, Avatar, Badge, ListItem, Header, Divider,
} from "@tuesday-ui/ui";

const conversations = [
  { id: 1, name: "Sarah Mitchell", message: "The seller accepted your offer! Let's discuss next steps.", time: "2m", unread: 2 },
  { id: 2, name: "James Rodriguez", message: "I'll send over the inspection report by end of day.", time: "15m", unread: 1 },
  { id: 3, name: "Emily Chen", message: "Are you available for a showing tomorrow at 2pm?", time: "1h", unread: 0 },
  { id: 4, name: "Michael Thompson", message: "The appraisal came in at $740,000.", time: "3h", unread: 0 },
  { id: 5, name: "Lisa Park", message: "I've updated the listing photos. Take a look!", time: "5h", unread: 3 },
  { id: 6, name: "David Kim", message: "Contract is ready for your signature.", time: "1d", unread: 0 },
  { id: 7, name: "Rachel Adams", message: "Thanks for the walkthrough yesterday!", time: "2d", unread: 0 },
];

export default function Inbox() {
  return (
    <ScrollView className="flex-1 bg-background">
      <VStack className="p-6 max-w-xl mx-auto gap-4">
        <Link href="/showcase" asChild>
          <Button variant="ghost" size="sm">← Back to Showcase</Button>
        </Link>

        <Header title="Messages" />

        <VStack className="gap-0">
          {conversations.map((c, i) => (
            <React.Fragment key={c.id}>
              <ListItem
                leading={<Avatar name={c.name} />}
                title={c.name}
                subtitle={c.message}
                trailing={
                  <VStack className="items-end gap-1">
                    <Text className="text-xs text-foreground-muted">{c.time}</Text>
                    {c.unread > 0 && <Badge variant="error">{c.unread}</Badge>}
                  </VStack>
                }
              />
              {i < conversations.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </VStack>
      </VStack>
    </ScrollView>
  );
}
