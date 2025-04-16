import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { Ionicons } from "@expo/vector-icons";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onNextPage: () => void;
  onPrevPage: () => void;
}

const Pagination = ({
  currentPage,
  totalPages,
  onNextPage,
  onPrevPage,
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <View className="flex-row justify-center items-center mt-6 mb-10">
      <TouchableOpacity
        onPress={onPrevPage}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded-lg mr-3 ${currentPage === 1 ? 'bg-zinc-800/40' : 'bg-zinc-800'
          }`}
        activeOpacity={0.7}
      >
        <Ionicons
          name="chevron-back"
          size={20}
          color={currentPage === 1 ? '#666' : '#fff'}
        />
      </TouchableOpacity>

      <Text className="text-white text-base font-medium">
        Trang {currentPage} / {totalPages}
      </Text>

      <TouchableOpacity
        onPress={onNextPage}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 rounded-lg ml-3 ${currentPage === totalPages ? 'bg-zinc-800/40' : 'bg-zinc-800'
          }`}
        activeOpacity={0.7}
      >
        <Ionicons
          name="chevron-forward"
          size={20}
          color={currentPage === totalPages ? '#666' : '#fff'}
        />
      </TouchableOpacity>
    </View>
  );
};

export default Pagination;