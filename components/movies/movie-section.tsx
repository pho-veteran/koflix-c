import React, { useRef, useMemo } from "react";
import { FlatList, View, TouchableOpacity, useWindowDimensions } from "react-native";
import { MovieBase } from "@/types/movie";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import MovieCard from "./movie-card";
import { ArrowRight } from "lucide-react-native";
import { HStack } from "@/components/ui/hstack";
import {
  GRID_CONFIG
} from "@/constants/ui-constants";

interface MovieSectionProps {
  title: string;
  subtitle?: string;
  movies: MovieBase[];
  emptyText: string;
  onSeeAllPress?: () => void;
  displayMode?: 'poster' | 'thumbnail';
  thumbnailColumns?: 1 | 2;
}

const MovieSection: React.FC<MovieSectionProps> = ({
  title,
  subtitle,
  movies,
  emptyText,
  onSeeAllPress,
  displayMode = 'poster',
  thumbnailColumns = 2
}) => {
  const flatListRef = useRef<FlatList>(null);
  const { width } = useWindowDimensions();

  const gridConfig = useMemo(() => {
    let numColumns: number = thumbnailColumns;
    const gap = GRID_CONFIG.GAP;

    if (thumbnailColumns === 2) {
      if (width >= GRID_CONFIG.LARGE_SCREEN_WIDTH) {
        numColumns = GRID_CONFIG.LARGE_SCREEN_COLUMNS;
      } else if (width >= GRID_CONFIG.MEDIUM_SCREEN_WIDTH) {
        numColumns = GRID_CONFIG.MEDIUM_SCREEN_COLUMNS;
      } else {
        numColumns = GRID_CONFIG.DEFAULT_COLUMNS;
      }
    }

    return {
      numColumns,
      gap,
    };
  }, [width, thumbnailColumns]);

  if (!movies || movies.length === 0) {
    return (
      <View className="my-5">
        <Heading size="lg" className="mb-3 text-typography-950">{title}</Heading>
        {subtitle && (
          <Text className="text-typography-600 text-xs mt-1 mb-3">{subtitle}</Text>
        )}
        <View className="bg-secondary-200/40 rounded-xl p-5 items-center justify-center border border-secondary-300/30">
          <Text className="text-typography-600 italic text-sm">{emptyText}</Text>
        </View>
      </View>
    );
  }

  const isThumbMode = displayMode === 'thumbnail';
  const isSingleColumn = isThumbMode && thumbnailColumns === 1;

  const renderThumbnailItem = ({ item, index }: { item: MovieBase, index: number }) => (
    <View style={{
      flex: 1,
      margin: gridConfig.gap / 2,
      ...(isSingleColumn && { height: 120, marginHorizontal: gridConfig.gap })
    }}>
      <MovieCard
        movie={item}
        index={index}
        displayMode="thumbnail"
      />
    </View>
  );

  const renderPosterItem = ({ item, index }: { item: MovieBase, index: number }) => (
    <MovieCard
      movie={item}
      index={index}
      displayMode="poster"
    />
  );

  return (
    <View className="my-5">
      <HStack className="mb-3 justify-between items-center">
        <View>
          <Heading size="lg" className="text-typography-950">{title}</Heading>
          {subtitle && (
            <Text className="text-typography-600 text-xs mt-0.5">{subtitle}</Text>
          )}
        </View>

        {onSeeAllPress && (
          <TouchableOpacity
            onPress={onSeeAllPress}
            className="flex-row items-center bg-secondary-200/30 px-3 py-1.5 rounded-full"
            activeOpacity={0.7}
          >
            <Text className="text-typography-700 font-medium mr-1 text-xs">Xem tất cả</Text>
            <ArrowRight size={12} color="#666" />
          </TouchableOpacity>
        )}
      </HStack>

      {isThumbMode ? (
        <FlatList
          data={movies}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderThumbnailItem}
          numColumns={gridConfig.numColumns}
          key={`thumbnail-${gridConfig.numColumns}`}
          scrollEnabled={false}
          style={{
            margin: isSingleColumn ? -gridConfig.gap : -gridConfig.gap / 2
          }}
        />
      ) : (
        <FlatList
          ref={flatListRef}
          horizontal
          data={movies}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          renderItem={renderPosterItem}
          className="-mx-1 px-1"
          contentContainerClassName="pr-4"
          initialNumToRender={5}
          maxToRenderPerBatch={8}
          windowSize={5}
          removeClippedSubviews={true}
        />
      )}
    </View>
  );
};

export default MovieSection;