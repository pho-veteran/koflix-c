import React from 'react';
import { View, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import Video from 'react-native-video';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer } from '@/hooks/use-video-player';
import { DownloadTask } from '@/types/download-type';
import { NETFLIX_RED } from '@/constants/ui-constants';
import OfflineVideoControls from './offline-video-control';
import { Text } from '@/components/ui/text';

interface OfflineVideoPlayerProps {
  downloadTask: DownloadTask;
  isFullscreen: boolean;
  videoPlayerHook: ReturnType<typeof useVideoPlayer>;
  playbackRate: number;
  onChangePlaybackRate: (rate: number) => void;
}

const OfflineVideoPlayer = ({
  downloadTask,
  isFullscreen,
  videoPlayerHook,
  playbackRate,
  onChangePlaybackRate
}: OfflineVideoPlayerProps) => {
  const {
    videoRef,
    fadeAnim,
    isLoading,
    setIsLoading,
    error,
    setError,
    isPlaying,
    showControls,
    currentTime,
    duration,
    isSeeking,
    setIsSeeking,
    toggleFullscreen,
    togglePlay,
    toggleControls,
    handleGoBack,
    handleProgress,
    handleLoad,
    handleSeek,
    seekBySeconds,
  } = videoPlayerHook;

  const getDisplayTitle = () => {
    if (downloadTask?.episodeData?.episodeServerFileName) {
      return downloadTask.episodeData.episodeServerFileName;
    }
    return downloadTask?.title || '';
  };

  const displayTitle = getDisplayTitle();

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={toggleControls}
      style={[
        styles.videoContainer,
        isFullscreen ? styles.fullscreenVideo : { height: (videoPlayerHook.videoInfo.width && videoPlayerHook.videoInfo.height) 
          ? (videoPlayerHook.videoInfo.width / videoPlayerHook.videoInfo.height > 1 ? 230 : 300) 
          : 230 
        }
      ]}
    >
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
        onChangePlaybackRate={onChangePlaybackRate}
        seekBySeconds={seekBySeconds} // Add this prop
      />

      {isLoading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={NETFLIX_RED} />
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={32} color="#fff" />
          <Text className="text-typography-800 mt-2 text-center">{error}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    zIndex: 3,
  }
});

export default OfflineVideoPlayer;