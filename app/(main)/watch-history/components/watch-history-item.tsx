import React from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { EpisodeWatchHistory } from "@/types/user-movie-type";

type WatchHistoryItemProps = {
  item: EpisodeWatchHistory;
  onPress: (item: EpisodeWatchHistory) => void;
};

const formatWatchedTime = (timestamp: string) => {
  try {
    return formatDistanceToNow(new Date(timestamp), { 
      addSuffix: true,
      locale: vi 
    });
  } catch {
    return "Không xác định";
  }
};

export default function WatchHistoryItem({ item, onPress }: WatchHistoryItemProps) {
  return (
    <View className="bg-secondary-200/30 rounded-xl mb-3 flex-row overflow-hidden">
      {/* Full-height image container */}
      <View className="w-24 relative">
        {item.movie?.thumb_url ? (
          <Image
            source={{ uri: item.movie.poster_url }}
            className="w-full h-full absolute inset-0"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center bg-secondary-300/50">
            <Ionicons name="film-outline" size={24} color="#9ca3af" />
          </View>
        )}
        <View className="absolute bottom-0 left-0 right-0 bg-black/70 py-1 px-2">
          <Text className="text-typography-800 text-xs text-center">
            {item.progress.toFixed(0)}%
          </Text>
        </View>
      </View>
      
      {/* Content section */}
      <TouchableOpacity
        className="flex-1 p-4"
        onPress={() => onPress(item)}
        activeOpacity={0.7}
      >
        <VStack className="flex-1 justify-center">
          <Text className="text-typography-800 font-medium" numberOfLines={1}>
            {item.movie?.name || "Không xác định"}
          </Text>
          
          <HStack className="items-center mt-1">
            <Ionicons name="play-circle-outline" size={14} color="#9ca3af" />
            <Text className="text-typography-600 text-sm ml-1.5" numberOfLines={1}>
              {item.episodeServer?.episode?.name
                ? `${item.episodeServer.episode.name}`
                : ""}
            </Text>
          </HStack>
          
          <HStack className="items-center mt-1">
            <Ionicons name="server-outline" size={14} color="#9ca3af" />
            <Text className="text-typography-500 text-xs ml-1.5">
              {item.episodeServer?.server_name || ""}
            </Text>
          </HStack>

          {/* Progress bar */}
          <View className="h-1.5 bg-secondary-300/30 rounded-full mt-2.5 overflow-hidden">
            <View
              className="h-full bg-primary-400 rounded-full"
              style={{ width: `${item.progress}%` }}
            />
          </View>
          
          <HStack className="items-center justify-between mt-2">
            <Text className="text-typography-500 text-xs">
              {formatWatchedTime(item.watchedAt)}
            </Text>
            
            <TouchableOpacity 
              className="bg-primary-400/20 rounded-full px-2.5 py-1"
              onPress={() => onPress(item)}
            >
              <Text className="text-primary-400 text-xs font-medium">Tiếp tục</Text>
            </TouchableOpacity>
          </HStack>
        </VStack>
      </TouchableOpacity>
    </View>
  );
}