import React, { useEffect, useState, useCallback } from "react";
import { View, RefreshControl, Alert, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { useDownload } from "@/providers/download-context";
import { useAuth } from "@/providers/auth-context";
import * as DownloadService from "@/services/download-service";
import * as StorageService from "@/services/storage-service";
import { DownloadStatus, DownloadTask } from "@/types/download-type";
import { router } from "expo-router";
import { NETFLIX_RED, LOADING, HEADER_HEIGHT } from "@/constants/ui-constants";
import Header from "@/components/layout/home-header";
import ConfirmationModal, { ConfirmationType } from "@/components/modals/confirmation-modal";

// Import custom components
import DownloadGroup from "@/components/downloaded/downloaded-group";
import EmptyState from "@/components/downloaded/empty-state";
import ErrorState from "@/components/downloaded/error-state";
import LoadingState from "@/components/downloaded/loading-state";

export default function DownloadedPage() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { isInitialized, refreshDownloads, downloads: allDownloads } = useDownload();
  const { firebaseUser } = useAuth();
  const userId = firebaseUser?.uid || '';

  const [downloads, setDownloads] = useState<DownloadTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [groupedCompletedDownloads, setGroupedCompletedDownloads] = useState<{ [key: string]: DownloadTask[] }>({});
  const [error, setError] = useState("");

  // Separated download lists by status
  const [downloadingTasks, setDownloadingTasks] = useState<DownloadTask[]>([]);
  const [cancelledTasks, setCancelledTasks] = useState<DownloadTask[]>([]);

  // Download confirmation modal state
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadConfirmationType, setDownloadConfirmationType] = useState<ConfirmationType>('delete');
  const [downloadTitle, setDownloadTitle] = useState('');
  const [isDownloadLoading, setIsDownloadLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<DownloadTask | null>(null);

  const groupDownloadsByMovie = useCallback((tasks: DownloadTask[]) => {
    const grouped: { [key: string]: DownloadTask[] } = {};

    tasks.forEach(task => {
      const movieId = task.episodeData?.movieId || `unknown-${task.title.split(" - ")[0]}`;

      if (!grouped[movieId]) {
        grouped[movieId] = [];
      }
      grouped[movieId].push(task);
    });

    return grouped;
  }, []);

  const loadDownloads = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      if (!isInitialized) {
        await refreshDownloads();
      }

      // Filter downloads by current user
      const userDownloads = userId
        ? allDownloads.filter(task => task.userId === userId)
        : [];

      // Sort by creation date (newest first)
      userDownloads.sort((a, b) => b.createdAt - a.createdAt);

      // Store all downloads
      setDownloads(userDownloads);

      // Filter by status
      const downloading = userDownloads.filter(task => task.status === DownloadStatus.DOWNLOADING);
      const cancelled = userDownloads.filter(task => task.status === DownloadStatus.CANCELLED);
      const completed = userDownloads.filter(task => task.status === DownloadStatus.COMPLETED);

      setDownloadingTasks(downloading);
      setCancelledTasks(cancelled);

      // Group all download types by movieId
      setGroupedCompletedDownloads(groupDownloadsByMovie(completed));

      setError("");
    } catch (err) {
      console.error("Error loading downloads:", err);
      setError("Không thể tải danh sách video đã tải. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isInitialized, refreshDownloads, allDownloads, userId, groupDownloadsByMovie]);

  useEffect(() => {
    if (isFocused) {
      loadDownloads();
    }
  }, [isFocused, loadDownloads, userId]);

  const handleRefresh = () => {
    loadDownloads(true);
  };

  const handleDeleteDownload = (task: DownloadTask) => {
    setSelectedTask(task);
    setDownloadTitle(task.title);
    setDownloadConfirmationType('delete');
    setIsDownloadModalOpen(true);
  };

  const handlePlayVideo = (task: DownloadTask) => {
    // Check if the file actually exists
    StorageService.checkFileExists(task.filePath).then(exists => {
      if (exists) {
        // Navigate to the offline player with the task ID
        router.push(`/downloaded-player/${task.id}`);
      } else {
        // If file doesn't exist, show error and offer to download again
        Alert.alert(
          "Không tìm thấy tệp video",
          "Tệp video có thể đã bị xóa hoặc di chuyển. Bạn có muốn tải lại video này không?",
          [
            { text: "Không", style: "cancel" },
            {
              text: "Tải lại",
              onPress: () => handleRetryDownload(task)
            }
          ]
        );
      }
    });
  };

  const handleCancelDownload = (task: DownloadTask) => {
    setSelectedTask(task);
    setDownloadTitle(task.title);
    setDownloadConfirmationType('cancel');
    setIsDownloadModalOpen(true);
  };

  const handleRetryDownload = (task: DownloadTask) => {
    setSelectedTask(task);
    setDownloadTitle(task.title);
    setDownloadConfirmationType('retry');
    setIsDownloadModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedTask) return;

    setIsDownloadLoading(true);
    try {
      switch (downloadConfirmationType) {
        case 'delete':
          const success = await DownloadService.deleteDownloadedFile(selectedTask.id);
          if (!success) {
            Alert.alert("Lỗi", "Không thể xóa video. Vui lòng thử lại sau.");
          }
          break;

        case 'cancel':
          await DownloadService.cancelDownload(selectedTask.id);
          break;

        case 'retry':
          await DownloadService.deleteDownloadedFile(selectedTask.id);

          if (selectedTask.m3u8Url && selectedTask.episodeData && userId) {
            await DownloadService.startDownload(
              selectedTask.episodeData.episodeId || selectedTask.id,
              selectedTask.m3u8Url,
              null,
              selectedTask.title,
              userId,
              {
                movieId: selectedTask.episodeData.movieId,
                episodeName: selectedTask.episodeData.episodeName,
                episodeId: selectedTask.episodeData.episodeId,
                episodeServerId: selectedTask.episodeData.episodeServerId,
                episodeServerFileName: selectedTask.episodeData.episodeServerFileName,
                episodeServerName: selectedTask.episodeData.episodeServerName
              },
              selectedTask.thumbUrl
            );
          }
          break;
      }

    } catch (error) {
      console.error(`Error during ${downloadConfirmationType} action:`, error);
      Alert.alert("Lỗi", `Không thể thực hiện thao tác. Vui lòng thử lại sau.`);
    } finally {
      setIsDownloadLoading(false);
      setIsDownloadModalOpen(false);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => loadDownloads()} />;
  }

  // Show login prompt if no user is logged in
  if (!userId) {
    return (
      <View className="flex-1 bg-black">
        <Header />
        <View className="flex-1 justify-center items-center p-6"
          style={{ paddingTop: HEADER_HEIGHT + insets.top }}>
          <Text className="text-typography-800 text-center text-base mb-4">
            Vui lòng đăng nhập để xem danh sách video đã tải xuống
          </Text>
        </View>
      </View>
    );
  }

  const hasAnyDownloads = downloads.length > 0;

  return (
    <View className="flex-1 bg-black">
      <Header />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT + insets.top,
          paddingBottom: 60,
          flexGrow: !hasAnyDownloads ? 1 : undefined
        }}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={NETFLIX_RED}
            colors={[NETFLIX_RED]}
            progressBackgroundColor={LOADING.REFRESH_BACKGROUND}
            progressViewOffset={HEADER_HEIGHT + insets.top}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <StatusBar style="light" />

        {!hasAnyDownloads ? (
          <EmptyState />
        ) : (
          <>
            {downloadingTasks.length > 0 && (
              <View className="mt-4 mb-4">
                <Text className="text-typography-800 font-semibold text-base mb-3 px-4">
                  Đang tải xuống ({downloadingTasks.length})
                </Text>

                {Object.entries(groupDownloadsByMovie(downloadingTasks)).map(([movieId, tasks]) => (
                  <DownloadGroup
                    key={`downloading-${movieId}`}
                    title={`Phim: ${tasks[0].title.split(" - ")[0]}`}
                    movieId={movieId}
                    tasks={tasks}
                    type="downloading"
                    onCancelDownload={handleCancelDownload}
                    onDeleteDownload={handleDeleteDownload}
                  />
                ))}
              </View>
            )}

            {cancelledTasks.length > 0 && (
              <View className="mt-4 mb-4">
                <Text className="text-typography-800 font-semibold text-base mb-3 px-4">
                  Tải xuống thất bại ({cancelledTasks.length})
                </Text>

                {Object.entries(groupDownloadsByMovie(cancelledTasks)).map(([movieId, tasks]) => (
                  <DownloadGroup
                    key={`cancelled-${movieId}`}
                    title={`Phim: ${tasks[0].title.split(" - ")[0]}`}
                    movieId={movieId}
                    tasks={tasks}
                    type="cancelled"
                    onDeleteDownload={handleDeleteDownload}
                    onRetryDownload={handleRetryDownload}
                  />
                ))}
              </View>
            )}

            {Object.keys(groupedCompletedDownloads).length > 0 && (
              <View className="mb-4 mt-4">
                <Text className="text-typography-800 font-semibold text-base mb-3 px-4">
                  Đã tải xuống
                </Text>
                {Object.keys(groupedCompletedDownloads).map(movieId => (
                  <DownloadGroup
                    key={movieId}
                    title={`Phim: ${groupedCompletedDownloads[movieId][0].title.split(" - ")[0]}`}
                    movieId={movieId}
                    tasks={groupedCompletedDownloads[movieId]}
                    type="completed"
                    onPlayVideo={handlePlayVideo}
                    onDeleteDownload={handleDeleteDownload}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {isRefreshing && (
        <View
          className="absolute top-0 left-0 right-0 flex-row justify-center"
          style={{ top: HEADER_HEIGHT + insets.top + 10 }}
        >
          <View className="bg-secondary-100/80 px-4 py-2 rounded-full">
            <Text className="text-typography-950 text-xs">Đang cập nhật...</Text>
          </View>
        </View>
      )}

      <ConfirmationModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        onConfirm={handleConfirmAction}
        confirmationType={downloadConfirmationType}
        title={downloadTitle}
        isLoading={isDownloadLoading}
      />
    </View>
  );
}