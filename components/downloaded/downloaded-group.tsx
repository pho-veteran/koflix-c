import React from "react";
import { View, FlatList } from "react-native";
import { Text } from "@/components/ui/text";
import { DownloadTask } from "@/types/download-type";
import DownloadingItem from "./downloading-item";
import DownloadedItem from "./downloaded-item";
import CancelledItem from "./cancelled-item";

interface DownloadGroupProps {
  title: string;
  movieId: string;
  tasks: DownloadTask[];
  type: "completed" | "downloading" | "cancelled";
  onPlayVideo?: (task: DownloadTask) => void;
  onDeleteDownload: (task: DownloadTask) => void;
  onCancelDownload?: (task: DownloadTask) => void;
  onRetryDownload?: (task: DownloadTask) => void;
}

const DownloadGroup: React.FC<DownloadGroupProps> = ({
  title,
  movieId,
  tasks,
  type,
  onPlayVideo,
  onDeleteDownload,
  onCancelDownload,
  onRetryDownload
}) => {
  if (!tasks || tasks.length === 0) return null;

  const renderCompletedGroup = () => (
    <View className="mb-6">
      <Text className="text-typography-800 font-semibold text-base mb-2 px-4">
        {title}
      </Text>

      <FlatList
        data={tasks}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <DownloadedItem 
            item={item} 
            onPlayVideo={onPlayVideo!} 
            onDeleteDownload={onDeleteDownload} 
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
      />
    </View>
  );

  const renderDownloadingGroup = () => (
    <View className="mb-4">
      <Text className="text-typography-800 font-semibold text-base mb-2 px-4">
        {title}
      </Text>

      {tasks.map(item => (
        <DownloadingItem 
          key={item.id} 
          item={item} 
          onCancelDownload={onCancelDownload!} 
        />
      ))}
    </View>
  );

  const renderCancelledGroup = () => (
    <View className="mb-4">
      <Text className="text-typography-800 font-semibold text-base mb-2 px-4">
        {title}
      </Text>

      {tasks.map(item => (
        <CancelledItem 
          key={item.id} 
          item={item} 
          onDeleteDownload={onDeleteDownload} 
          onRetryDownload={onRetryDownload!} 
        />
      ))}
    </View>
  );

  switch (type) {
    case "completed":
      return renderCompletedGroup();
    case "downloading":
      return renderDownloadingGroup();
    case "cancelled":
      return renderCancelledGroup();
    default:
      return null;
  }
};

export default DownloadGroup;