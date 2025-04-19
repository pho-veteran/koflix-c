import React from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { Ionicons } from "@expo/vector-icons";

const EmptyState: React.FC = () => {
  return (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <Ionicons name="cloud-download-outline" size={64} color="#666" />
      <Text className="text-typography-700 text-lg font-medium mt-4 text-center">
        Chưa có video nào được tải xuống
      </Text>
      <Text className="text-typography-500 text-sm mt-2 text-center">
        Các video bạn tải xuống sẽ xuất hiện ở đây để xem offline
      </Text>
    </View>
  );
};

export default EmptyState;