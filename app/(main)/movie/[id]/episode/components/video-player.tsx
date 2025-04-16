import React, { useRef, useState, useEffect } from 'react';
import { View, TouchableOpacity, ActivityIndicator, StyleSheet, Platform, Dimensions } from 'react-native';
import Video, { VideoRef, OnProgressData } from 'react-native-video';
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { NETFLIX_RED } from "@/constants/ui-constants";
import { EpisodeServer } from "@/types/movie";
import { VStack } from '@/components/ui/vstack';

interface VideoPlayerProps {
  selectedServer: EpisodeServer | null;
  isFullscreen: boolean;
  isVideoLoading: boolean;
  isPlaying: boolean;
  videoError: string;
  showControls: boolean;
  onVideoPress: () => void;
  onTogglePlay: () => void;
  onToggleFullscreen: () => void;
  onGoBack: () => void;
  onOpenEpisodeModal: () => void;
  setIsVideoLoading: (loading: boolean) => void;
  setVideoError: (error: string) => void;
}

const VideoPlayer = ({
  selectedServer,
  isFullscreen,
  isVideoLoading,
  isPlaying,
  videoError,
  showControls,
  onVideoPress,
  onTogglePlay,
  onToggleFullscreen,
  onGoBack,
  onOpenEpisodeModal,
  setIsVideoLoading,
  setVideoError
}: VideoPlayerProps) => {
  const videoRef = useRef<VideoRef>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const clearTimer = () => {
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
        controlsTimerRef.current = null;
      }
    };

    clearTimer();

    if (showControls && isPlaying && !isSeeking) {
      controlsTimerRef.current = setTimeout(() => {
        onVideoPress();
      }, 3000);
    }

    return clearTimer;
  }, [showControls, isPlaying, isSeeking, onVideoPress]);

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleProgress = (data: OnProgressData) => {
    if (!isSeeking) {
      setCurrentTime(data.currentTime);
    }
  };

  const handleLoad = (data: any) => {
    setDuration(data.duration);
    setIsVideoLoading(false);
  };

  const handleSeek = (locationX: number) => {
    const { width } = Dimensions.get('window');
    const percentage = locationX / width;
    const newTime = percentage * duration;

    setCurrentTime(newTime);

    if (videoRef.current) {
      videoRef.current.seek(newTime);
    }
  };

  const handleStartSeeking = () => setIsSeeking(true);

  const handleEndSeeking = () => setIsSeeking(false);

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onVideoPress}
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
          onLoad={handleLoad}
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
        />
      ) : (
        <View className="flex-1 bg-secondary-200 justify-center items-center">
          <Text className="text-typography-500">Không có nguồn phát</Text>
        </View>
      )}

      {showControls && (
        <View style={styles.controlsContainer}>
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0)']}
            style={[styles.controlBar, styles.topBar]}
          >
            <HStack className="justify-between items-center w-full px-4">
              <TouchableOpacity onPress={onGoBack} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              {!isFullscreen && (
                <Text className="text-typography-800 font-medium pl-2" numberOfLines={1}>
                  {selectedServer?.filename}
                </Text>
              )}
              {isFullscreen && (
                <TouchableOpacity
                  onPress={onOpenEpisodeModal}
                  className="bg-secondary-300/60 px-3 py-1 rounded-full"
                >
                  <HStack space="xs" className="items-center">
                    <Ionicons name="list" size={16} color="#fff" />
                    <Text className="text-typography-800 text-xs">Tập phim</Text>
                  </HStack>
                </TouchableOpacity>
              )}
            </HStack>
          </LinearGradient>

          <TouchableOpacity
            onPress={onTogglePlay}
            style={styles.centerButton}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <View className="bg-primary-400/80 rounded-full w-16 h-16 items-center justify-center">
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={30}
                color="#fff"
                style={isPlaying ? {} : { marginLeft: 4 }}
              />
            </View>
          </TouchableOpacity>

          <VStack>
            <View style={styles.progressBarContainer}>
              <HStack className="justify-between w-full px-4 mb-1">
                <Text className="text-typography-800 text-xs">
                  {formatTime(currentTime)}
                </Text>
                <Text className="text-typography-800 text-xs">
                  {formatTime(duration)}
                </Text>
              </HStack>

              <TouchableOpacity
                activeOpacity={1}
                onPressIn={handleStartSeeking}
                onPressOut={handleEndSeeking}
                onPress={(event) => handleSeek(event.nativeEvent.locationX)}
                style={styles.progressBarTouchable}
              >
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${(currentTime / duration) * 100}%` }
                    ]}
                  />
                </View>
              </TouchableOpacity>
            </View>

            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
              style={[styles.controlBar, styles.bottomBar]}
            >
              <HStack className="justify-between items-center w-full px-4">
                <Text className="text-typography-800 text-xs">
                  {selectedServer?.server_name || "Đang phát"}
                </Text>
                <TouchableOpacity
                  onPress={onToggleFullscreen}
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                  <Ionicons
                    name={isFullscreen ? "contract" : "expand"}
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>
              </HStack>
            </LinearGradient>
          </VStack>
        </View>
      )}

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
  controlsContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  controlBar: {
    width: '100%',
  },
  topBar: {
    paddingTop: Platform.OS === 'ios' ? 44 : 10,
  },
  bottomBar: {
    paddingBottom: Platform.OS === 'ios' ? 34 : 10,
  },
  centerButton: {
    alignSelf: 'center',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
  },
  progressBarContainer: {
    width: '100%',
  },
  progressBarTouchable: {
    height: 25,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: NETFLIX_RED,
    borderRadius: 3,
  },
});

export default VideoPlayer;