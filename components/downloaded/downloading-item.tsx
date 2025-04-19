import React from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { DownloadTask } from "@/types/download-type";

interface DownloadingItemProps {
  item: DownloadTask;
  onCancelDownload: (task: DownloadTask) => void;
}

const DownloadingItem: React.FC<DownloadingItemProps> = ({ 
  item, 
  onCancelDownload 
}) => {
  const episodeName = item.episodeData?.episodeName || item.title.split(" - ")[1] || item.title;

  return (
    <View className="bg-secondary-200/80 rounded-xl mx-4 mb-4 overflow-hidden">
      <HStack className="items-center">
        <View className="w-28 h-24 bg-secondary-300 rounded-md overflow-hidden mr-3">
          {item.thumbUrl ? (
            <Image
              source={{ uri: item.thumbUrl }}
              contentFit="cover"
              style={{ width: "100%", height: "100%" }}
              transition={300}
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Ionicons name="film-outline" size={20} color="#888" />
            </View>
          )}
        </View>

        <VStack className="flex-1 mr-2">
          <Text className="text-typography-950 font-medium" numberOfLines={1}>
            {episodeName}
          </Text>
          {item.episodeData?.episodeServerName && (
            <Text className="text-typography-500 text-xs pt-1">
              {item.episodeData.episodeServerName}
            </Text>
          )}

          <VStack className="mt-2" space="xs">
            <HStack className="items-center">
              <ActivityIndicator size="small" color="#3F5EFB" style={{ marginRight: 8 }} />
              <Text className="text-typography-500 text-xs">
                Đang tải xuống...
              </Text>
            </HStack>
          </VStack>
        </VStack>

        <TouchableOpacity
          onPress={() => onCancelDownload(item)}
          className="p-2"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close-circle-outline" size={22} color="#888" />
        </TouchableOpacity>
      </HStack>
    </View>
  );
};

export default DownloadingItem;