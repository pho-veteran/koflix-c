import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { Ionicons } from "@expo/vector-icons";

type EmptyStateProps = {
  onExplore: () => void;
};

export default function EmptyState({ onExplore }: EmptyStateProps) {
  return (
    <View className="py-10 items-center justify-center px-6">
      <Ionicons name="film-outline" size={60} color="#666" />
      <Text className="text-typography-800 font-medium mt-4 text-center">
        Bạn chưa xem phim nào
      </Text>
      <Text className="text-typography-600 mt-2 text-center">
        Lịch sử xem phim sẽ xuất hiện ở đây sau khi bạn xem phim
      </Text>
      <TouchableOpacity
        className="mt-6 bg-primary-400 rounded-lg px-6 py-3"
        onPress={onExplore}
        activeOpacity={0.8}
      >
        <Text className="text-white font-medium">Khám phá phim</Text>
      </TouchableOpacity>
    </View>
  );
}