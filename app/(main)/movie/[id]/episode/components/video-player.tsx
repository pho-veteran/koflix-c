import React from 'react';
import { View, TouchableOpacity, ActivityIndicator, StyleSheet, Platform, Animated } from 'react-native';
import Video from 'react-native-video';
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { NETFLIX_RED } from "@/constants/ui-constants";
import { EpisodeServer } from "@/types/movie-type";
import { useVideoPlayer } from '@/hooks/use-video-player';
import VideoPlayerControls from './video-player-control';

interface VideoPlayerProps {
  selectedServer: EpisodeServer | null;
  isFullscreen: boolean;
  videoPlayerHook: ReturnType<typeof useVideoPlayer>;
  onVideoLoaded?: () => void;
  onOpenEpisodeModal: () => void;

  movieId?: string;
  movieName?: string;
  episodeId?: string;
  episodeName?: string;
  posterUrl?: string;
  thumbUrl?: string;
  playbackRate: number;
  onChangePlaybackRate: (rate: number) => void;
}

const VideoPlayer = ({
  selectedServer,
  isFullscreen,
  videoPlayerHook,
  onOpenEpisodeModal,
  onVideoLoaded,
  movieId,
  movieName,
  episodeId,
  episodeName,
  thumbUrl,
  playbackRate,
  onChangePlaybackRate
}: VideoPlayerProps) => {
  const {
    videoRef,
    fadeAnim,
    isLoading: isVideoLoading,
    setIsLoading: setIsVideoLoading,
    error: videoError,
    setError: setVideoError,
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
    formatTime,
    seekBySeconds,
  } = videoPlayerHook;

  const handleStartSeeking = () => setIsSeeking(true);
  const handleEndSeeking = () => setIsSeeking(false);

  const customHandleLoad = (data: any) => {
    handleLoad(data);
    if (onVideoLoaded) {
      onVideoLoaded();
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={toggleControls}
      style={[
        styles.videoContainer,
        isFullscreen ? styles.fullscreenVideo : { height: 230 }
      ]}
    >
      {selectedServer?.link_m3u8 ? (
        <Video
          ref={videoRef}
          source={{ uri: selectedServer.link_m3u8 }}
          style={styles.video}
          resizeMode="contain"
          onLoadStart={() => setIsVideoLoading(true)}
          onLoad={customHandleLoad}
          onProgress={handleProgress}
          onError={(error) => {
            console.error("Video error:", error);
            setVideoError("Không thể phát video. Vui lòng thử nguồn phát khác.");
            setIsVideoLoading(false);
          }}
          paused={!isPlaying}
          playInBackground={false}
          repeat={false}
          controls={false}
          rate={playbackRate}
        />
      ) : (
        <View className="flex-1 bg-secondary-200 justify-center items-center">
          <Text className="text-typography-500">Không có nguồn phát</Text>
        </View>
      )}

      {/* Video Controls Component */}
      <VideoPlayerControls
        visible={showControls}
        isPlaying={isPlaying}
        isFullscreen={isFullscreen}
        currentTime={currentTime}
        duration={duration}
        filename={selectedServer?.filename}
        onVideoPress={toggleControls}
        onTogglePlay={togglePlay}
        onToggleFullscreen={toggleFullscreen}
        onGoBack={handleGoBack}
        onSeek={handleSeek}
        onStartSeeking={handleStartSeeking}
        onEndSeeking={handleEndSeeking}
        onOpenEpisodeModal={onOpenEpisodeModal}
        fadeAnim={fadeAnim}
        serverName={selectedServer?.server_name}
        formatTime={formatTime}
        seekBySeconds={seekBySeconds}

        // Download button props
        movieId={movieId}
        movieName={movieName}
        episodeId={episodeId}
        episodeName={episodeName}
        episodeServerId={selectedServer?.id}
        episodeServerName={selectedServer?.server_name}
        episodeServerFileName={selectedServer?.filename}
        m3u8Url={selectedServer?.link_m3u8}
        thumbUrl={thumbUrl}
        playbackRate={playbackRate}
        onChangePlaybackRate={onChangePlaybackRate}
      />

      {isVideoLoading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={NETFLIX_RED} />
        </View>
      )}

      {videoError && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={32} color="#fff" />
          <Text className="text-typography-800 mt-2 text-center">{videoError}</Text>
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
    zIndex: 100,
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

export default VideoPlayer;