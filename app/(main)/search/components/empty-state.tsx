import React from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { Ionicons } from "@expo/vector-icons";

interface EmptyStateProps {
  searchQuery: string;
}

const EmptyState = ({ searchQuery }: EmptyStateProps) => {
  return (
    <View className="flex-1 items-center justify-center py-20 px-6">
      {searchQuery.trim().length > 0 ? (
        <>
          <Ionicons name="search-outline" size={48} color="#666" />
          <Text className="text-zinc-400 mt-3 text-center text-lg">
            Không tìm thấy kết quả nào cho "{searchQuery}"
          </Text>
          <Text className="text-zinc-500 mt-2 text-center">
            Hãy thử với từ khóa khác hoặc điều chỉnh bộ lọc
          </Text>
        </>
      ) : (
        <>
          <Ionicons name="search" size={48} color="#666" />
          <Text className="text-zinc-400 mt-3 text-center text-lg">
            Nhập từ khóa để tìm kiếm phim
          </Text>
          <Text className="text-zinc-500 mt-2 text-center">
            Hoặc sử dụng bộ lọc để tìm theo thể loại, quốc gia
          </Text>
        </>
      )}
    </View>
  );
};

export default EmptyState;