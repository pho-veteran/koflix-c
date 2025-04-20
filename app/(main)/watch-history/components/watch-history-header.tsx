import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";

interface WatchHistoryHeaderProps {
  onBackPress: () => void;
}

const WatchHistoryHeader = ({ onBackPress }: WatchHistoryHeaderProps) => {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={["rgba(0,0,0,1)", "rgba(0,0,0,0.8)", "transparent"]}
      className="absolute top-0 left-0 right-0 z-10 pt-4"
      style={{ paddingTop: insets.top + 8 }}
    >
      <View className="flex-row px-4 items-center">
        <TouchableOpacity
          onPress={onBackPress}
          className="mr-3 w-10 h-10 rounded-full bg-zinc-800/80 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <View className="flex-1">
          <Text className="text-typography-800 text-lg font-medium">Lịch sử xem</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

export default WatchHistoryHeader;