import React from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Keyboard } from "react-native";

interface SearchHeaderProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onClearSearch: () => void;
  onOpenFilters: () => void;
  onBackPress: () => void;
  hasActiveFilters: boolean;
}

const SearchHeader = ({
  searchQuery,
  onSearchChange,
  onClearSearch,
  onOpenFilters,
  onBackPress,
  hasActiveFilters,
}: SearchHeaderProps) => {
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

        <View className="flex-1 flex-row bg-zinc-800/60 rounded-full px-4 py-2.5 items-center">
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            placeholder="Tìm kiếm phim..."
            placeholderTextColor="#9ca3af"
            className="flex-1 ml-2 text-white text-base"
            value={searchQuery}
            onChangeText={onSearchChange}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={onClearSearch}>
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={onOpenFilters}
          className="ml-3 w-10 h-10 rounded-full items-center justify-center"
          style={{
            backgroundColor: hasActiveFilters
              ? 'rgba(229, 9, 20, 0.8)'
              : 'rgba(82, 82, 91, 0.8)'
          }}
        >
          <Ionicons name="options-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default SearchHeader;