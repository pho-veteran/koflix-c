import React, { useState, useEffect } from 'react';
import { TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import * as DownloadService from '@/services/download-service';
import { useCallback } from 'react';

interface DownloadButtonProps {
  videoId: string;
  m3u8Url: string;
  title: string;
  posterUrl?: string;
  thumbUrl?: string;
  iconSize?: number;
  showText?: boolean;
  iconColor?: string;
  // Updated props without server object
  movieId?: string;
  movieName?: string;
  episodeId?: string;
  episodeName?: string;
  episodeServerId?: string;
  episodeServerFileName?: string;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  videoId,
  m3u8Url,
  title,
  posterUrl,
  thumbUrl,
  iconSize = 24,
  showText = false,
  iconColor = "#fff",
  // Episode data
  movieId,
  movieName,
  episodeId,
  episodeName,
  episodeServerId,
  episodeServerFileName,
}) => {
  const [downloadTask, setDownloadTask] = useState<DownloadService.DownloadTask | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize download service when component mounts
  useEffect(() => {
    DownloadService.initializeDownloadService();
    
    // Check if this video has already been downloaded or is in progress
    checkDownloadStatus();
    
    // Poll for updates every second (could be optimized with a real event system)
    const interval = setInterval(checkDownloadStatus, 1000);
    return () => clearInterval(interval);
  }, [videoId]);

  const checkDownloadStatus = useCallback(() => {
    const status = DownloadService.getDownloadStatus(videoId);
    setDownloadTask(status);
  }, [videoId]);

  const handleDownloadPress = async () => {
    // If nothing has been downloaded yet or download failed
    if (!downloadTask || downloadTask.status === DownloadService.DownloadStatus.FAILED || 
        downloadTask.status === DownloadService.DownloadStatus.CANCELLED) {
      setIsLoading(true);
      try {
        const episodeData = {
          movieId,
          movieName,
          episodeId,
          episodeName,
          episodeServerId,
          episodeServerFileName,
        };
        
        await DownloadService.startDownload(
          videoId, 
          m3u8Url, 
          title, 
          posterUrl, 
          episodeData,
          thumbUrl
        );
      } catch (error) {
        console.error("Error starting download:", error);
        Alert.alert("Lỗi tải xuống", "Không thể bắt đầu tải xuống. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    } 
    // If download is in progress
    else if (downloadTask.status === DownloadService.DownloadStatus.DOWNLOADING || 
             downloadTask.status === DownloadService.DownloadStatus.PENDING) {
      Alert.alert(
        "Hủy tải xuống?",
        `Bạn có muốn hủy việc tải xuống "${title}"?`,
        [
          { text: "Tiếp tục tải", style: "cancel" },
          { 
            text: "Hủy tải xuống", 
            style: "destructive",
            onPress: async () => {
              setIsLoading(true);
              try {
                await DownloadService.cancelDownload(videoId);
              } catch (error) {
                console.error("Error cancelling download:", error);
              } finally {
                setIsLoading(false);
              }
            }
          }
        ]
      );
    } 
    // If download is complete, offer to delete
    else if (downloadTask.status === DownloadService.DownloadStatus.COMPLETED) {
      Alert.alert(
        "Xóa video đã tải",
        `Bạn có muốn xóa "${title}" khỏi danh sách đã tải xuống?`,
        [
          { text: "Hủy", style: "cancel" },
          { 
            text: "Xóa", 
            style: "destructive",
            onPress: async () => {
              setIsLoading(true);
              try {
                await DownloadService.deleteDownloadedFile(videoId);
              } catch (error) {
                console.error("Error deleting download:", error);
              } finally {
                setIsLoading(false);
              }
            }
          }
        ]
      );
    }
  };

  // Render the appropriate icon based on download status
  const renderIcon = () => {
    if (isLoading) {
      return <ActivityIndicator size="small" color={iconColor} />;
    }

    if (!downloadTask) {
      return <Ionicons name="download-outline" size={iconSize} color={iconColor} />;
    }

    switch (downloadTask.status) {
      case DownloadService.DownloadStatus.PENDING:
        return <Ionicons name="hourglass-outline" size={iconSize} color={iconColor} />;
      
      case DownloadService.DownloadStatus.DOWNLOADING:
        return (
          <HStack space="xs" className="items-center">
            <ActivityIndicator size="small" color={iconColor} />
          </HStack>
        );
      
      case DownloadService.DownloadStatus.COMPLETED:
        return <Ionicons name="checkmark-circle-outline" size={iconSize} color={iconColor} />;
      
      case DownloadService.DownloadStatus.FAILED:
        return <Ionicons name="alert-circle-outline" size={iconSize} color="red" />;
      
      case DownloadService.DownloadStatus.CANCELLED:
        return <Ionicons name="close-circle-outline" size={iconSize} color={iconColor} />;
      
      default:
        return <Ionicons name="download-outline" size={iconSize} color={iconColor} />;
    }
  };

  const getButtonLabel = () => {
    if (!downloadTask) return "Tải xuống";
    
    switch (downloadTask.status) {
      case DownloadService.DownloadStatus.PENDING:
        return "Đang chờ...";
      case DownloadService.DownloadStatus.DOWNLOADING:
        return "Đang tải xuống...";
      case DownloadService.DownloadStatus.COMPLETED:
        return "Đã tải xuống";
      case DownloadService.DownloadStatus.FAILED:
        return "Tải thất bại";
      case DownloadService.DownloadStatus.CANCELLED:
        return "Đã hủy";
      default:
        return "Tải xuống";
    }
  };

  return (
    <TouchableOpacity
      onPress={handleDownloadPress}
      disabled={isLoading}
      className="items-center justify-center"
      hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
    >
      {renderIcon()}
      {showText && (
        <Text className="text-xs text-typography-800 mt-1">
          {getButtonLabel()}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default DownloadButton;