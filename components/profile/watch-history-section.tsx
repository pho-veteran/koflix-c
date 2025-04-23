import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Ionicons } from "@expo/vector-icons";
import { EpisodeWatchHistory } from "@/types/user-movie-type";
import WatchHistoryItem from '@/app/(main)/watch-history/components/watch-history-item'; 

interface WatchHistorySectionProps {
  watchHistory: EpisodeWatchHistory[];
  onViewAll: () => void;
  onItemPress: (item: EpisodeWatchHistory) => void;
}

const WatchHistorySection: React.FC<WatchHistorySectionProps> = ({
  watchHistory,
  onViewAll,
  onItemPress
}) => {
  return (
    <VStack className="px-5 py-4">
      <HStack className="justify-between items-center mb-3">
        <Heading size="sm" className="text-typography-800">
          Xem gần đây
        </Heading>
        <TouchableOpacity onPress={onViewAll}>
          <HStack className="items-center">
            <Text className="text-primary-400 text-sm mr-1">Xem tất cả</Text>
            <Ionicons name="chevron-forward" size={16} color="#f43f5e" />
          </HStack>
        </TouchableOpacity>
      </HStack>

      {watchHistory.length > 0 ? (
        <VStack space="sm">
          {watchHistory.map((item) => (
            <WatchHistoryItem
              key={item.id}
              item={item}
              onPress={() => onItemPress(item)}
            />
          ))}
        </VStack>
      ) : (
        <View className="py-5 items-center">
          <Ionicons name="film-outline" size={36} color="#666" />
          <Text className="text-typography-600 mt-2 text-center">
            Bạn chưa xem phim nào gần đây
          </Text>
        </View>
      )}
    </VStack>
  );
};

export default WatchHistorySection;