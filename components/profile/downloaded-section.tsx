import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Ionicons } from "@expo/vector-icons";
import { DownloadTask } from "@/types/download-type";

interface DownloadedSectionProps {
  recentDownload: DownloadTask | null;
  onViewAll: () => void;
  onItemPress: (downloadId: string) => void;
}

const DownloadedSection: React.FC<DownloadedSectionProps> = ({
  recentDownload,
  onViewAll,
  onItemPress
}) => {
  return (
    <VStack className="px-5 py-4">
      <HStack className="justify-between items-center mb-3">
        <Heading size="sm" className="text-typography-800">
          Phim đã tải xuống
        </Heading>
        <TouchableOpacity onPress={onViewAll}>
          <HStack className="items-center">
            <Text className="text-primary-400 text-sm mr-1">Xem tất cả</Text>
            <Ionicons name="chevron-forward" size={16} color="#f43f5e" />
          </HStack>
        </TouchableOpacity>
      </HStack>

      {recentDownload ? (
        <TouchableOpacity
          className="bg-secondary-200/30 rounded-lg p-3 flex-row"
          onPress={() => onItemPress(recentDownload.id)}
        >
          <View className="w-20 h-20 rounded-lg bg-secondary-300/50 mr-3 overflow-hidden">
            {recentDownload.thumbUrl ? (
              <Image
                source={{ uri: recentDownload.thumbUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full items-center justify-center">
                <Ionicons name="film-outline" size={24} color="#9ca3af" />
              </View>
            )}
            <View className="absolute top-1 right-1 bg-green-500/80 rounded-full p-1">
              <Ionicons name="checkmark-circle" size={12} color="#fff" />
            </View>
          </View>

          <VStack className="flex-1 justify-center">
            <Text className="text-typography-800 font-medium" numberOfLines={1}>
              {recentDownload.episodeData?.episodeName || recentDownload.title.split(" - ")[1] || recentDownload.title}
            </Text>
            <Text className="text-typography-600 text-sm" numberOfLines={1}>
              {recentDownload.episodeData?.episodeServerName || "Offline"}
            </Text>
            <HStack className="items-center mt-2">
              <Ionicons name="time-outline" size={14} color="#9ca3af" />
              <Text className="text-typography-500 text-xs ml-1">
                {new Date(recentDownload.createdAt).toLocaleDateString()}
              </Text>
            </HStack>
          </VStack>
        </TouchableOpacity>
      ) : (
        <View className="py-5 items-center">
          <Ionicons name="download-outline" size={36} color="#666" />
          <Text className="text-typography-600 mt-2 text-center">
            Bạn chưa tải xuống phim nào
          </Text>
        </View>
      )}
    </VStack>
  );
};

export default DownloadedSection;