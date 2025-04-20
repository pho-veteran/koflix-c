import React from "react";
import { View, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui/text";
import { 
  LOADING, 
  TEXT_STYLING,
  APP_NAME 
} from "@/constants/ui-constants";

export default function LoadingState() {
  return (
    <View className="flex-1 bg-secondary-100 justify-center items-center">
      <StatusBar style="light" />
      <Text
        className="text-primary-400 font-bold text-3xl tracking-tighter mb-8"
        style={{
          textShadowColor: TEXT_STYLING.SHADOW_COLOR,
          textShadowOffset: TEXT_STYLING.SHADOW_OFFSET,
          textShadowRadius: TEXT_STYLING.SHADOW_RADIUS
        }}
      >
        {APP_NAME}
      </Text>
      <ActivityIndicator size="large" color={LOADING.INDICATOR_COLOR} />
    </View>
  );
}