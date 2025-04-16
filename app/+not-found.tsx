import { Link, Stack } from "expo-router";
import { View, Image, StyleSheet } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { NETFLIX_RED } from "@/constants/ui-constants";
import { useAuth } from "@/providers/auth-context";

export default function NotFoundScreen() {
  const { user, isLoading } = useAuth();

  return (
    <>
      <StatusBar style="light" />
      <View className="flex-1 bg-secondary-100">
        {/* Background with gradient */}
        <LinearGradient
          colors={['rgba(229, 9, 20, 0.15)', 'transparent', 'transparent']}
          locations={[0, 0.4, 1]}
          className="absolute inset-0"
        />

        {/* Grid overlay */}
        <View className="absolute inset-0 opacity-10">
          <View className="flex-row justify-between absolute inset-0">
            {[...Array(8)].map((_, i) => (
              <View key={`v-${i}`} className="w-px h-full bg-outline-200" />
            ))}
          </View>
          <View className="flex-col justify-between absolute inset-0">
            {[...Array(12)].map((_, i) => (
              <View key={`h-${i}`} className="w-full h-px bg-outline-200" />
            ))}
          </View>
        </View>

        <VStack className="flex-1 items-center justify-center p-8">
          {/* App logo */}
          <Image
            source={require("@/assets/images/koflix-logo-nobg.png")}
            className="w-[150px] h-[60px] mb-8"
            resizeMode="contain"
          />

          {/* Error icon */}
          <View className="bg-secondary-200/80 w-24 h-24 rounded-full items-center justify-center mb-8">
            <Ionicons name="alert-circle" size={64} color={NETFLIX_RED} />
          </View>

          {/* Error content */}
          <Heading
            className="mb-4 text-typography-950 text-center"
            size="xl"
          >
            404 - Không tìm thấy trang
          </Heading>

          <Text
            className="mb-8 text-center text-typography-600 max-w-xs"
          >
            Trang bạn đang tìm kiếm không tồn tại hoặc đã được chuyển đến vị trí khác.
          </Text>

          {/* Conditional button based on auth state */}
          {isLoading ? (
            <Button
              className="bg-primary-400/70 w-full max-w-xs"
              isDisabled={true}
            >
              <ButtonText className="text-typography-950 font-bold">
                Đang tải...
              </ButtonText>
            </Button>
          ) : user ? (
            // User is logged in - show Home button
            <Link href="/(main)/(tabs)/home" asChild>
              <Button
                className="bg-primary-400 w-full max-w-xs"
                android_ripple={{ color: 'rgba(0,0,0,0.2)' }}
              >
                <ButtonText className="text-typography-950 font-bold">
                  Quay về Trang chủ
                </ButtonText>
              </Button>
            </Link>
          ) : (
            // User is not logged in - show Sign In button
            <Link href="/(auth)/login" asChild>
              <Button
                className="bg-primary-400 w-full max-w-xs"
                android_ripple={{ color: 'rgba(0,0,0,0.2)' }}
              >
                <ButtonText className="text-typography-950 font-bold">
                  Đăng nhập
                </ButtonText>
              </Button>
            </Link>
          )}
        </VStack>

        {/* Bottom gradient */}
        <LinearGradient
          colors={['transparent', 'rgba(18, 18, 18, 0.9)']}
          locations={[0.7, 1]}
          className="absolute bottom-0 left-0 right-0 h-32"
        />
      </View>
    </>
  );
}
