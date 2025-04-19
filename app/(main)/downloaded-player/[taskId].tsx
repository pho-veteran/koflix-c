import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Video from 'react-native-video';
import * as StorageService from '@/services/storage-service';
import { DownloadTask } from '@/types/download-type';
import { NETFLIX_RED } from '@/constants/ui-constants';
import OfflineVideoControls from './components/offline-video-control';
import { Text } from '@/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { useVideoPlayer } from '@/hooks/use-video-player';

export default function OfflinePlayerScreen() {
  const { taskId } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [downloadTask, setDownloadTask] = useState<DownloadTask | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  
  // Use the video player hook
  const videoPlayerHook = useVideoPlayer({
    onGoBack: () => router.back()
  });

  const {
    videoRef,
    fadeAnim,
    isLoading, 
    setIsLoading,
    error, 
    setError,
    isPlaying,
    isFullscreen,
    showControls,
    currentTime,
    duration,
    isSeeking,
    setIsSeeking,
    videoInfo,
    toggleFullscreen,
    togglePlay,
    toggleControls,
    handleGoBack,
    handleProgress,
    handleLoad,
    handleSeek,
    seekBySeconds
  } = videoPlayerHook;

  // Load the download task
  useEffect(() => {
    if (!taskId) return;
    
    const task = StorageService.getTask(taskId as string);
    if (!task) {
      setError('Video không tồn tại hoặc đã bị xóa');
      return;
    }
    
    setDownloadTask(task);
    setIsLoading(false);
  }, [taskId, setError, setIsLoading]);

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
  };

  // Format movie title and episode name
  const formatVideoInfo = () => {
    if (!downloadTask) return { movieName: '', episodeName: '' };
    
    const parts = downloadTask.title.split(' - ');
    if (parts.length > 1) {
      return {
        movieName: parts[0],
        episodeName: parts.slice(1).join(' - ')
      };
    }
    
    return {
      movieName: downloadTask.title,
      episodeName: ''
    };
  };

  // Get the display title - preferring episodeServerFileName if available
  const getDisplayTitle = () => {
    if (downloadTask?.episodeData?.episodeServerFileName) {
      return downloadTask.episodeData.episodeServerFileName;
    }
    return downloadTask?.title || '';
  };

  // If not focused, don't render anything
  if (!videoPlayerHook.isFocused) {
    return null;
  }

  if (isLoading) {
    return (
      <View style={[
        styles.container,
        !isFullscreen && { paddingTop: insets.top }
      ]}>
        <StatusBar hidden={isFullscreen} />
        <ActivityIndicator size="large" color={NETFLIX_RED} />
      </View>
    );
  }

  if (error || !downloadTask) {
    return (
      <View style={[
        styles.container,
        !isFullscreen && { paddingTop: insets.top }
      ]}>
        <StatusBar hidden={isFullscreen} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={40} color={NETFLIX_RED} />
          <Text className="text-typography-800 text-center text-lg font-medium mt-4 mb-2">
            {error || 'Không thể phát video này'}
          </Text>
          <TouchableOpacity
            onPress={handleGoBack}
            className="bg-primary-400 px-6 py-3 rounded-full mt-4 active:opacity-80"
          >
            <Text className="text-white font-medium">Quay lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const { movieName } = formatVideoInfo();
  const isPortrait = !isFullscreen;
  const aspectRatio = videoInfo.width && videoInfo.height 
    ? videoInfo.width / videoInfo.height 
    : 16/9;
  const displayTitle = getDisplayTitle();

  return (
    <View
      style={[
        styles.container,
        isFullscreen ? styles.fullscreen : { paddingTop: insets.top }
      ]}
    >
      <StatusBar hidden={isFullscreen} />
      
      <View style={[
        styles.videoContainer, 
        isFullscreen ? styles.fullscreenVideo : { height: aspectRatio > 1 ? 230 : 300 }
      ]}>
        <Video
          ref={videoRef}
          source={{ uri: `file://${downloadTask.filePath}` }}
          style={styles.video}
          resizeMode="contain"
          onLoad={handleLoad}
          onProgress={handleProgress}
          onError={(error) => {
            console.error("Video error:", error);
            setError("Không thể phát video này. Tệp có thể bị hỏng.");
          }}
          paused={!isPlaying}
          playInBackground={false}
          repeat={false}
          rate={playbackRate}
          controls={false}
        />

        <OfflineVideoControls
          visible={showControls}
          isPlaying={isPlaying}
          isFullscreen={isFullscreen}
          currentTime={currentTime}
          duration={duration}
          title={displayTitle}
          playbackRate={playbackRate}
          onVideoPress={toggleControls}
          onTogglePlay={togglePlay}
          onToggleFullscreen={toggleFullscreen}
          onGoBack={handleGoBack}
          onSeek={handleSeek}
          onStartSeeking={() => setIsSeeking(true)}
          onEndSeeking={() => setIsSeeking(false)}
          onChangePlaybackRate={handlePlaybackRateChange}
          seekBySeconds={seekBySeconds} // Add this line to pass the function
        />

        {isLoading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={NETFLIX_RED} />
          </View>
        )}
      </View>

      {isPortrait && (
        <VStack className="p-4 flex-1">
          {/* Video title section */}
          <Text className="text-typography-800 text-lg font-semibold">{displayTitle}</Text>
          
          {downloadTask.episodeData?.movieId && (
            <HStack className="mt-2 items-center">
              <Text className="text-typography-600">Phim: </Text>
              <Text className="text-typography-800">{movieName}</Text>
            </HStack>
          )}
          
          {/* Downloaded info section */}
          <HStack className="mt-4 mb-3 items-center">
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text className="text-green-500 text-xs ml-1">Đã tải xuống</Text>
            
            <Text className="text-typography-600 text-xs ml-4">
              {new Date(downloadTask.createdAt).toLocaleDateString()}
            </Text>
          </HStack>
          
          {/* Info about offline mode */}
          <View className="bg-background-300/10 p-4 rounded-lg mt-6">
            <HStack className="items-center mb-2">
              <Ionicons name="information-circle-outline" size={20} color="#9CA3AF" />
              <Text className="text-typography-800 font-medium ml-2">Chế độ xem offline</Text>
            </HStack>
            <Text className="text-typography-600 text-sm">
              Video này được lưu trữ trên thiết bị của bạn và có thể xem mà không cần kết nối internet.
              Để quản lý các video đã tải, vui lòng truy cập trang "Đã tải xuống".
            </Text>
          </View>
        </VStack>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c0e',
  },
  fullscreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  videoContainer: {
    width: '100%',
    backgroundColor: '#000',
    position: 'relative',
  },
  fullscreenVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});