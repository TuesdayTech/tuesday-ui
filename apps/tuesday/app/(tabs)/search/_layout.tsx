import { Stack } from "expo-router";
import { SearchProvider } from "../../../providers/search-provider";

export default function SearchLayout() {
  return (
    <SearchProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SearchProvider>
  );
}
