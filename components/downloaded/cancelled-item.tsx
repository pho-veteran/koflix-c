import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { DownloadTask } from "@/types/download-type";

interface CancelledItemProps {
  item: DownloadTask;
  onDeleteDownload: (task: DownloadTask) => void;
  onRetryDownload: (task: DownloadTask) => void;
}

const CancelledItem: React.FC<CancelledItemProps> = ({ 
  item, 
  onDeleteDownload, 
  onRetryDownload 
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
            <Text className="text-typography-500 text-xs mt-1">
              Tải xuống thất bại
            </Text>
          </VStack>
        </VStack>

        <HStack space="sm">
          <TouchableOpacity
            onPress={() => onDeleteDownload(item)}
            className="p-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={22} color="#ef4444" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onRetryDownload(item)}
            className="p-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="refresh-outline" size={22} color="#3F5EFB" />
          </TouchableOpacity>
        </HStack>
      </HStack>
    </View>
  );
};

export default CancelledItem;