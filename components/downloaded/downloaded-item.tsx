import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { DownloadTask } from "@/types/download-type";

interface DownloadedItemProps {
  item: DownloadTask;
  onPlayVideo: (task: DownloadTask) => void;
  onDeleteDownload: (task: DownloadTask) => void;
}

const DownloadedItem: React.FC<DownloadedItemProps> = ({ 
  item, 
  onPlayVideo, 
  onDeleteDownload 
}) => {
  const episodeName = item.episodeData?.episodeName || item.title.split(" - ")[1] || item.title;

  return (
    <View className="bg-secondary-200 rounded-xl overflow-hidden shadow-md mb-4" style={{ width: 180 }}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onPlayVideo(item)}
        className="relative"
      >
        <View className="w-full aspect-video relative">
          <Image
            source={{ uri: item.thumbUrl }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            transition={300}
          />

          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
            className="absolute inset-0 items-center justify-center"
          >
            <View className="bg-primary-400/80 rounded-full w-10 h-10 items-center justify-center">
              <Ionicons name="play" size={20} color="#fff" />
            </View>
          </LinearGradient>
        </View>

        <VStack className="p-3">
          <Text className="text-typography-950 font-semibold mb-1" numberOfLines={1}>
            {episodeName}
          </Text>

          <HStack className="justify-between items-center">
            <Text className="text-typography-500 text-xs">
              {item.episodeData?.episodeServerName || "Offline"}
            </Text>

            <TouchableOpacity
              onPress={() => onDeleteDownload(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={16} color="#ef4444" />
            </TouchableOpacity>
          </HStack>
        </VStack>
      </TouchableOpacity>
    </View>
  );
};

export default DownloadedItem;