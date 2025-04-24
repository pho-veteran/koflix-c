import React from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";

interface SearchWithAIProps {
  contentSearchQuery: string;
  onContentSearchChange: (text: string) => void;
  onClearContentSearch: () => void;
  onToggleContentSearch: () => void;
  showContentSearch: boolean;
}

const SearchWithAI = ({
  contentSearchQuery,
  onContentSearchChange,
  onClearContentSearch,
  onToggleContentSearch,
  showContentSearch,
}: SearchWithAIProps) => {
  return (
    <View className="px-4">
      <TouchableOpacity
        onPress={onToggleContentSearch}
        className="flex-row items-center mb-2"
      >
        <Ionicons
          name={showContentSearch ? "chevron-down-circle" : "chevron-forward-circle"}
          size={20}
          color="#E50914"
        />
        <Text className="text-white ml-2 font-medium">Tìm kiếm bằng mô tả</Text>
        <View className="ml-2 bg-primary-400/20 px-2 py-0.5 rounded">
          <Text className="text-primary-400 text-xs">AI</Text>
        </View>
      </TouchableOpacity>

      {showContentSearch && (
        <View className="bg-zinc-800/60 rounded-lg p-3 mb-4">
          <TextInput
            className="text-white min-h-[80px] text-base"
            placeholder="Mô tả phim bạn muốn tìm... (Ví dụ: phim về người đàn ông quên ký ức)"
            placeholderTextColor="#9ca3af"
            multiline
            textAlignVertical="top"
            value={contentSearchQuery}
            onChangeText={onContentSearchChange}
          />
          
          <View className="flex-row justify-end items-center mt-3">
            <Text className="text-zinc-500 text-xs flex-1 mr-2">
              {contentSearchQuery.length > 0 
                ? "AI sẽ tìm phim phù hợp với mô tả của bạn" 
                : "Hãy mô tả phim bạn muốn tìm"}
            </Text>
            
            {contentSearchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={onClearContentSearch}
                className="px-3 py-1.5"
              >
                <Text className="text-primary-400">Xóa</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default SearchWithAI;