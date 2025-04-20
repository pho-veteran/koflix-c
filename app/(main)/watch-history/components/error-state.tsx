import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { 
  TEXT_STYLING,
  APP_NAME 
} from "@/constants/ui-constants";

type ErrorStateProps = {
  error: string;
  onRetry: () => void;
};

export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <View className="py-10 items-center justify-center px-6">
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
      <View className="bg-secondary-200/80 p-6 rounded-xl border border-secondary-300 w-full max-w-md items-center">
        <Text className="text-error-400 text-lg font-bold text-center mb-3">{error}</Text>
        <Text className="text-typography-600 text-center mb-6">
          Vui lòng kiểm tra kết nối internet và thử lại.
        </Text>
        <TouchableOpacity
          className="bg-primary-400 px-5 py-3 rounded-md"
          onPress={onRetry}
          activeOpacity={0.8}
        >
          <Text className="text-typography-950 font-medium">
            Thử lại
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}