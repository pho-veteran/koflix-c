import React, { useState, useEffect, useMemo } from "react";
import { View, ActivityIndicator, FlatList, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { MovieBase } from "@/types/movie-type";
import ThumbnailCard from "./ThumbnailCard";
import { NETFLIX_RED } from "@/constants/ui-constants";
import { Ionicons } from "@expo/vector-icons";

interface ThumbnailSectionProps {
  title: string;
  movies: MovieBase[];
  emptyText: string;
  columns?: number;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

const ThumbnailSection: React.FC<ThumbnailSectionProps> = ({
  title,
  movies,
  emptyText,
  columns = 2,
  onLoadMore,
  isLoadingMore = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedMovies, setPaginatedMovies] = useState<MovieBase[]>([]);

  const itemsPerPage = useMemo(() => {
    return columns === 1 ? 4 : 12;
  }, [columns]);

  const totalPages = Math.ceil(movies.length / itemsPerPage);

  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedMovies(movies.slice(startIndex, endIndex));

    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, movies, itemsPerPage, totalPages]);

  if (!movies || movies.length === 0) {
    return (
      <View className="my-4">
        <Text className="text-white text-lg font-semibold mb-3">{title}</Text>
        <View className="bg-secondary-200/30 rounded-lg p-6 items-center justify-center">
          <Text className="text-typography-700 text-center">{emptyText}</Text>
        </View>
      </View>
    );
  }

  const renderItem = ({ item, index }: { item: MovieBase; index: number }) => (
    <View
      style={{
        width: columns === 1 ? '100%' : `${100 / columns}%`,
        padding: 4,
      }}
    >
      <ThumbnailCard movie={item} index={index} />
    </View>
  );

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <View className="my-4">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-white text-lg font-semibold">{title}</Text>
        {totalPages > 1 && (
          <Text className="text-typography-600 text-xs">
            Page {currentPage} of {totalPages}
          </Text>
        )}
      </View>

      <FlatList
        data={paginatedMovies}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={columns}
        key={`columns-${columns}`}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        contentContainerStyle={{ margin: -4 }}
        initialNumToRender={itemsPerPage}
        maxToRenderPerBatch={4}
        windowSize={5}
        ListFooterComponent={
          isLoadingMore ? (
            <View className="py-4 items-center">
              <ActivityIndicator color={NETFLIX_RED} />
            </View>
          ) : null
        }
      />

      {/* Pagination controls - only show if we have more than one page */}
      {totalPages > 1 && (
        <View className="flex-row justify-between items-center mt-3 px-2">
          <TouchableOpacity
            onPress={handlePrevPage}
            disabled={currentPage === 1}
            className={`px-3 py-2 rounded-md flex-row items-center ${currentPage === 1 ? 'opacity-50' : ''}`}
          >
            <Ionicons
              name="chevron-back"
              size={16}
              color={currentPage === 1 ? "#666" : "#fff"}
            />
            <Text className={`${currentPage === 1 ? 'text-typography-600' : 'text-white'} ml-1`}>
              Quay lại
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNextPage}
            disabled={currentPage === totalPages}
            className={`px-3 py-2 rounded-md flex-row items-center ${currentPage === totalPages ? 'opacity-50' : ''}`}
          >
            <Text className={`${currentPage === totalPages ? 'text-typography-600' : 'text-white'} mr-1`}>
              Tiếp theo
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={currentPage === totalPages ? "#666" : "#fff"}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ThumbnailSection;