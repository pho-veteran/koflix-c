import { useAuth } from "@/providers/auth-context";
import { useRouter, Stack } from "expo-router";
import { useEffect } from "react";

import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

(globalThis as any).RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;

export default function MainLayout() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/(auth)");
    }
  }, [user, authLoading, router]);

  if (!user) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="movie"
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen
        name="search"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="downloaded-player"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}