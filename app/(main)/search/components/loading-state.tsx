import React from "react";
import { View, ActivityIndicator } from "react-native";
import { Text } from "@/components/ui/text";
import { LOADING } from "@/constants/ui-constants";

const LoadingState = () => {
  return (
    <View className="flex-1 items-center justify-center py-20">
      <ActivityIndicator size="large" color={LOADING.INDICATOR_COLOR} />
      <Text className="text-zinc-400 mt-3">Đang tìm kiếm...</Text>
    </View>
  );
};

export default LoadingState;