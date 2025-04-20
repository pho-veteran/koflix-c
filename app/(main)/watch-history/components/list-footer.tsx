import React from "react";
import { View, ActivityIndicator } from "react-native";
import { NETFLIX_RED } from "@/constants/ui-constants";

type ListFooterProps = {
  isLoadingMore: boolean;
};

export default function ListFooter({ isLoadingMore }: ListFooterProps) {
  if (!isLoadingMore) return null;
  
  return (
    <View className="py-4 items-center">
      <ActivityIndicator size="small" color={NETFLIX_RED} />
    </View>
  );
}