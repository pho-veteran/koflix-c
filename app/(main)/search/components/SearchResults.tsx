import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { Ionicons } from "@expo/vector-icons";
import MovieSection from "@/components/movies/movie-section";
import { MovieBase } from "@/types/movie";

interface SearchResultsProps {
  results: MovieBase[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const SearchResults = ({
  results,
  totalResults,
  currentPage,
  totalPages,
  onClearFilters,
  hasActiveFilters,
}: SearchResultsProps) => {
  return (
    <View className="px-4">
      {/* Results count and pagination info */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-zinc-400">
          {totalResults} kết quả {totalPages > 1 ? `(Trang ${currentPage}/${totalPages})` : ''}
        </Text>
        {hasActiveFilters && (
          <TouchableOpacity
            onPress={onClearFilters}
            className="flex-row items-center"
          >
            <Text className="text-primary-500 mr-1">Xóa bộ lọc</Text>
            <Ionicons name="close-circle" size={16} color="#E50914" />
          </TouchableOpacity>
        )}
      </View>

      {/* Results grid */}
      <MovieSection
        title=""
        displayMode="thumbnail"
        thumbnailColumns={2}
        movies={results}
        emptyText=""
      />
    </View>
  );
};

export default SearchResults;