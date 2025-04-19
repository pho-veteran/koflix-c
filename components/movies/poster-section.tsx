import React, { useRef } from "react";
import { FlatList, View, TouchableOpacity } from "react-native";
import { MovieBase } from "@/types/movie-type";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import PosterCard from "./poster-card"; 
import { ArrowRight } from "lucide-react-native";
import { HStack } from "@/components/ui/hstack";

interface PosterSectionProps {
  title: string;
  subtitle?: string;
  movies: MovieBase[];
  emptyText: string;
  onSeeAllPress?: () => void;
}

const PosterSection: React.FC<PosterSectionProps> = ({
  title,
  subtitle,
  movies,
  emptyText,
  onSeeAllPress
}) => {
  const flatListRef = useRef<FlatList>(null);

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

  const renderPosterItem = ({ item, index }: { item: MovieBase, index: number }) => (
    <PosterCard
      movie={item}
      index={index}
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
    </View>
  );
};

export default PosterSection;