import { Redirect } from "expo-router";
import { useAuth } from "../providers/auth-provider";

export default function Index() {
  const { token, isLoading } = useAuth();

  if (isLoading) return null;

  return <Redirect href={token ? "/feed" : "/login"} />;
}
