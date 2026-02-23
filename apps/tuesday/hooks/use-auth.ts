import { useMutation } from "@tanstack/react-query";
import { api } from "../lib/api/client";
import { useAuth } from "../providers/auth-provider";
import type { LoginResponse } from "../types/auth";

export { useAuth } from "../providers/auth-provider";

export function useLogin() {
  const { setAuth } = useAuth();

  return useMutation({
    mutationFn: async ({ phone, code }: { phone: string; code: string }) => {
      const result = await api.request<LoginResponse>("auth/login", {
        method: "POST",
        body: { phone, code },
        responseKey: null, // login response is at root level: { token, message: Profile }
      });
      await setAuth(result.token, result.message);
      return result;
    },
  });
}

export function useSmsCheck() {
  return useMutation({
    mutationFn: async ({ phone }: { phone: string }) =>
      api.request<string>("auth/smsCheck", {
        method: "POST",
        body: { phone },
        responseKey: "message",
      }),
  });
}
