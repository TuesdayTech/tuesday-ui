import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { CaretLeft } from "phosphor-react-native";
import { Button } from "@tuesday-ui/ui";
import { TextField } from "@tuesday-ui/ui";
import { AlertBanner } from "@tuesday-ui/ui";
import { useThemeColors } from "../hooks/useThemeColors";
import { useSmsCheck, useLogin } from "../hooks/use-auth";

type Step = "phone" | "code";

function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

export default function LoginScreen() {
  const t = useThemeColors();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const codeInputRef = useRef<TextInput>(null);

  const smsCheck = useSmsCheck();
  const login = useLogin();

  const isPhoneValid = phone.replace(/\D/g, "").length >= 10;
  const isCodeValid = code.replace(/\D/g, "").length === 6;

  function getLast10Digits(raw: string): string {
    const digits = raw.replace(/\D/g, "");
    return digits.length > 10 ? digits.slice(-10) : digits;
  }

  function handleSendCode() {
    setError(null);
    const digits = getLast10Digits(phone);
    smsCheck.mutate(
      { phone: digits },
      {
        onSuccess: () => {
          setStep("code");
          setTimeout(() => codeInputRef.current?.focus(), 100);
        },
        onError: (err) => {
          setError(err.message || "Failed to send code. Please try again.");
        },
      },
    );
  }

  function handleLogin() {
    setError(null);
    const digits = getLast10Digits(phone);
    const codeDigits = code.replace(/\D/g, "");
    login.mutate(
      { phone: digits, code: codeDigits },
      {
        onSuccess: () => {
          router.replace("/feed");
        },
        onError: (err) => {
          setError(err.message || "Invalid code. Please try again.");
        },
      },
    );
  }

  function handleBack() {
    setStep("phone");
    setCode("");
    setError(null);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: "center" }}>
          {/* Back button (code step only) */}
          {step === "code" && (
            <Pressable
              onPress={handleBack}
              hitSlop={12}
              style={{
                position: "absolute",
                top: 16,
                left: 24,
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CaretLeft size={24} color={t.foreground} weight="bold" />
            </Pressable>
          )}

          {/* Logo mark */}
          <View style={{ alignItems: "center", marginBottom: 48 }}>
            <Text
              style={{
                fontFamily: "GeistSans-Bold",
                fontSize: 34,
                color: t.foreground,
                letterSpacing: -0.5,
              }}
            >
              Tuesday
            </Text>
            <Text
              style={{
                fontFamily: "GeistSans",
                fontSize: 15,
                color: t.foregroundMuted,
                marginTop: 8,
              }}
            >
              {step === "phone"
                ? "Sign in with your phone number"
                : `We sent a code to ${formatPhoneDisplay(phone)}`}
            </Text>
          </View>

          {/* Error banner */}
          {error && (
            <View style={{ marginBottom: 16 }}>
              <AlertBanner
                variant="error"
                message={error}
                dismissable
                onDismiss={() => setError(null)}
              />
            </View>
          )}

          {/* Phone step */}
          {step === "phone" && (
            <View style={{ gap: 16 }}>
              <TextField
                label="Phone number"
                placeholder="+1 (555) 000-0000"
                keyboardType="phone-pad"
                autoComplete="tel"
                textContentType="telephoneNumber"
                autoFocus
                value={phone}
                onChangeText={setPhone}
                onSubmitEditing={() => isPhoneValid && handleSendCode()}
                returnKeyType="next"
              />
              <Button
                size="lg"
                disabled={!isPhoneValid}
                loading={smsCheck.isPending}
                onPress={handleSendCode}
              >
                Send code
              </Button>
            </View>
          )}

          {/* Code step */}
          {step === "code" && (
            <View style={{ gap: 16 }}>
              <TextField
                ref={codeInputRef}
                label="Verification code"
                placeholder="Enter code"
                keyboardType="number-pad"
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                maxLength={6}
                value={code}
                onChangeText={setCode}
                onSubmitEditing={() => isCodeValid && handleLogin()}
                returnKeyType="done"
              />
              <Button
                size="lg"
                disabled={!isCodeValid}
                loading={login.isPending}
                onPress={handleLogin}
              >
                Sign in
              </Button>
              <Pressable
                onPress={handleBack}
                style={{ alignItems: "center", paddingVertical: 8 }}
              >
                <Text
                  style={{
                    fontFamily: "GeistSans-Medium",
                    fontSize: 15,
                    color: t.foregroundMuted,
                  }}
                >
                  Use a different number
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
