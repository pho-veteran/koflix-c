import React, { useState, useEffect, useCallback } from 'react';
import { TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DownloadService from '@/services/download-service';
import { DownloadStatus, DownloadTask } from '@/types/download-type';
import { useDownload } from '@/providers/download-context';
import { useAuth } from '@/providers/auth-context';
import ConfirmationModal, { ConfirmationType } from '@/components/modals/confirmation-modal';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { useRouter } from 'expo-router';

interface DownloadButtonProps {
  movieId: string;
  movieName: string;
  episodeId: string;
  episodeName: string;
  episodeServerId: string;
  episodeServerName: string;
  episodeServerFileName: string;
  m3u8Url: string;
  thumbUrl?: string;
  size?: number;
  showText?: boolean;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  movieId,
  movieName,
  episodeId,
  episodeName,
  episodeServerId,
  episodeServerName,
  episodeServerFileName,
  m3u8Url,
  thumbUrl,
  size = 24,
  showText = false
}) => {
  const router = useRouter();
  const { isInitialized, refreshDownloads, downloads } = useDownload();
  const { firebaseUser } = useAuth();
  const userId = firebaseUser?.uid || '';
  
  const [downloadTask, setDownloadTask] = useState<DownloadTask | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalType, setModalType] = useState<ConfirmationType>('download');

  const checkDownloadStatus = useCallback(() => {
    if (!userId) return;
    
    // Find the task from downloads array in context filtered by userId
    const task = downloads.find(task => 
      task.episodeData?.episodeServerId === episodeServerId && 
      task.userId === userId
    ) || null;
    
    setDownloadTask(task);
  }, [downloads, episodeServerId, userId]);

  useEffect(() => {
    if (isInitialized && episodeServerId && userId) {
      checkDownloadStatus();
    }
  }, [isInitialized, episodeServerId, userId, checkDownloadStatus]);

  const handlePress = () => {
    if (!isInitialized) {
      console.log('Download service not ready.');
      return;
    }
    
    if (!userId) {
      Alert.alert("Thông báo", "Vui lòng đăng nhập để tải xuống video.");
      return;
    }

    if (!downloadTask) {
      setModalType('download');
      setIsModalOpen(true);
    } else if (downloadTask.status === DownloadStatus.CANCELLED) {
      setModalType('retry');
      setIsModalOpen(true);
    } else if (downloadTask.status === DownloadStatus.DOWNLOADING) {
      setModalType('cancel');
      setIsModalOpen(true);
    } else if (downloadTask.status === DownloadStatus.COMPLETED) {
      // Play the video instead of showing the delete modal
      router.push(`/downloaded-player/${downloadTask.id}`);
    }
  };

  const handleLongPress = () => {
    if (downloadTask?.status === DownloadStatus.COMPLETED) {
      // Show delete confirmation on long press for completed downloads
      setModalType('delete');
      setIsModalOpen(true);
    }
  };

  const handleConfirm = async () => {
    if (!userId) {
      Alert.alert("Thông báo", "Vui lòng đăng nhập để tải xuống video.");
      return;
    }
    
    setIsLoading(true);

    try {
      const title = `${movieName} - ${episodeName}`;
      const episodeData = {
        movieId,
        episodeName,
        episodeId,
        episodeServerId,
        episodeServerName,
        episodeServerFileName
      };

      if (modalType === 'download') {
        await DownloadService.startDownload(
          episodeId,
          m3u8Url,
          title,
          userId,
          episodeData,
          thumbUrl
        );
      } else if (modalType === 'cancel' && downloadTask) {
        await DownloadService.cancelDownload(downloadTask.id);
      } else if (modalType === 'retry' && downloadTask) {
        await DownloadService.deleteDownloadedFile(downloadTask.id);
        await DownloadService.startDownload(
          episodeId,
          m3u8Url,
          title,
          userId,
          episodeData,
          thumbUrl
        );
      } else if (modalType === 'delete' && downloadTask) {
        const success = await DownloadService.deleteDownloadedFile(downloadTask.id);
        if (!success) {
          Alert.alert("Lỗi", "Không thể xóa video. Vui lòng thử lại sau.");
        }
      }

      await refreshDownloads();
    } catch (error) {
      console.error(`Download operation (${modalType}) failed:`, error);
      
      let errorMessage = '';
      switch (modalType) {
        case 'download':
          errorMessage = 'tải xuống';
          break;
        case 'cancel':
          errorMessage = 'hủy tải xuống';
          break;
        case 'retry':
          errorMessage = 'thử lại tải xuống';
          break;
        case 'delete':
          errorMessage = 'xóa video';
          break;
      }
      
      Alert.alert("Lỗi", `Không thể ${errorMessage}. Vui lòng thử lại sau.`);
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
      await new Promise(resolve => setTimeout(resolve, 150));
      checkDownloadStatus();
    }
  };

  const renderIcon = () => {
    if (!isInitialized) {
      return <Ionicons name="cloud-download-outline" size={size} color="#fff" />;
    }

    if (!downloadTask) {
      return <Ionicons name="cloud-download-outline" size={size} color="#fff" />;
    }

    switch (downloadTask.status) {
      case DownloadStatus.DOWNLOADING:
        return <ActivityIndicator size="small" color="#fff" />;
      case DownloadStatus.COMPLETED:
        // Change to a play icon when download is complete
        return <Ionicons name="play-circle-outline" size={size} color="#fff" />;
      case DownloadStatus.CANCELLED:
        return <Ionicons name="refresh-outline" size={size} color="#fff" />;
      default:
        return <Ionicons name="cloud-download-outline" size={size} color="#fff" />;
    }
  };

  const renderText = () => {
    if (!showText) return null;

    if (!isInitialized) {
      return <Text className="text-typography-800 text-xs ml-1">Tải xuống</Text>;
    }

    if (!downloadTask) {
      return <Text className="text-typography-800 text-xs ml-1">Tải xuống</Text>;
    }

    switch (downloadTask.status) {
      case DownloadStatus.DOWNLOADING:
        return <Text className="text-typography-800 text-xs ml-1">Đang tải...</Text>;
      case DownloadStatus.COMPLETED:
        // Change text to "Play Offline" when download is complete
        return <Text className="text-green-400 text-xs ml-1">Phát offline</Text>;
      case DownloadStatus.CANCELLED:
        return <Text className="text-red-400 text-xs ml-1">Thử lại</Text>;
      default:
        return <Text className="text-typography-800 text-xs ml-1">Tải xuống</Text>;
    }
  };

  const modalTitle = `${movieName} - ${episodeName}`;

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={500}
        disabled={!isInitialized || isLoading || !userId}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        className={`items-center justify-center ${!userId ? 'opacity-50' : ''}`}
      >
        {showText ? (
          <HStack className="items-center">
            {renderIcon()}
            {renderText()}
          </HStack>
        ) : (
          renderIcon()
        )}
      </TouchableOpacity>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        confirmationType={modalType}
        title={modalTitle}
        isLoading={isLoading}
      />
    </>
  );
};

export default DownloadButton;