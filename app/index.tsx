import { Redirect } from "expo-router";
import { useAuth } from "@/providers/auth-context";
import { useLoading } from "@/hooks/use-loading";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { ActivityIndicator } from "react-native";
import { Text } from "@/components/ui/text";

export default function Index() {
  const { user, isLoading: authLoading } = useAuth();
  const { setIsLoading, setMessage } = useLoading();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (authLoading) {
      setIsLoading(true);
      setMessage("Kiểm tra trạng thái đăng nhập...");
    } else {
      const timer = setTimeout(() => {
        setIsLoading(false);
        setIsReady(true);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [authLoading, setIsLoading, setMessage]);

  if (!isReady) {
    return (
      <View className="flex-1 bg-background-100 justify-center items-center">
        <ActivityIndicator size="large" color="#E50914" />
        <Text className="mt-4 text-typography-700"></Text>
      </View>
    );
  }

  return user ? <Redirect href="/(main)/(tabs)/home" /> : <Redirect href="/(auth)" />;
}