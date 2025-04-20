import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Platform, Dimensions } from 'react-native';
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { NETFLIX_RED } from "@/constants/ui-constants";
import DownloadButton from './download-button';

interface VideoPlayerControlsProps {
  visible: boolean;
  isPlaying: boolean;
  isFullscreen: boolean;
  currentTime: number;
  duration: number;
  filename?: string;
  onVideoPress: () => void;
  onTogglePlay: () => void;
  onToggleFullscreen: () => void;
  onGoBack: () => void;
  onSeek: (progress: number) => void;
  onStartSeeking: () => void;
  onEndSeeking: () => void;
  onOpenEpisodeModal: () => void;
  fadeAnim: Animated.Value;
  serverName?: string;
  formatTime: (time: number) => string;
  
  // Download button props
  movieId?: string;
  movieName?: string;
  episodeId?: string;
  episodeName?: string;
  episodeServerId?: string;
  episodeServerName?: string;
  episodeServerFileName?: string;
  m3u8Url?: string;
  thumbUrl?: string;

  // Playback speed props
  playbackRate: number;
  onChangePlaybackRate: (rate: number) => void;

  // Seek by seconds
  seekBySeconds: (seconds: number) => void;
}

const VideoPlayerControls = ({
  visible,
  isPlaying,
  isFullscreen,
  currentTime,
  duration,
  filename,
  onVideoPress,
  onTogglePlay,
  onToggleFullscreen,
  onGoBack,
  onSeek,
  onStartSeeking,
  onEndSeeking,
  onOpenEpisodeModal,
  fadeAnim,
  serverName,
  formatTime,
  movieId,
  movieName,
  episodeId,
  episodeName,
  episodeServerId,
  episodeServerName,
  episodeServerFileName,
  m3u8Url,
  thumbUrl,
  playbackRate,
  onChangePlaybackRate,
  seekBySeconds
}: VideoPlayerControlsProps) => {
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const clearTimer = () => {
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
        controlsTimerRef.current = null;
      }
    };

    clearTimer();

    if (visible && isPlaying && !showSpeedMenu) {
      controlsTimerRef.current = setTimeout(() => {
        onVideoPress();
      }, 3000);
    }

    return clearTimer;
  }, [visible, isPlaying, onVideoPress, showSpeedMenu]);

  const handleSeek = (locationX: number) => {
    const { width } = Dimensions.get('window');
    const progress = locationX / width;
    onSeek(Math.max(0, Math.min(1, progress)));
  };

  const handleSpeedSelect = (speed: number) => {
    onChangePlaybackRate(speed);
    setShowSpeedMenu(false);
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onVideoPress}
      style={StyleSheet.absoluteFill}
    >
      <Animated.View
        style={[
          styles.controlsContainer,
          { opacity: fadeAnim }
        ]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
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
                {filename}
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

        <View style={styles.centerControlsContainer}>
          <TouchableOpacity
            onPress={() => seekBySeconds(-10)}
            style={styles.seekButton}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <View className="bg-secondary-300/80 rounded-full w-12 h-12 items-center justify-center">
              <Ionicons name="play-back" size={22} color="#fff" />
            </View>
          </TouchableOpacity>

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
          
          <TouchableOpacity
            onPress={() => seekBySeconds(10)}
            style={styles.seekButton}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <View className="bg-secondary-300/80 rounded-full w-12 h-12 items-center justify-center">
              <Ionicons name="play-forward" size={22} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

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
              onPressIn={onStartSeeking}
              onPressOut={onEndSeeking}
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
              <HStack className="items-center" space='sm'>
                <Text className="text-typography-800 text-xs">
                  {serverName || "Đang phát"}
                </Text>

                <View className="relative">
                  <TouchableOpacity 
                    onPress={() => setShowSpeedMenu(!showSpeedMenu)}
                    className="bg-secondary-300/60 rounded-full px-3 py-1 flex-row items-center"
                  >
                    <HStack space="xs" className="items-center">
                      <Ionicons name="speedometer-outline" size={16} color="#fff" />
                      <Text className="text-typography-800 text-xs">{playbackRate}x</Text>
                    </HStack>
                  </TouchableOpacity>

                  {showSpeedMenu && (
                    <View className="absolute bottom-9 left-0 bg-background-300/90 rounded-md py-1 z-20 w-20">
                      {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(speed => (
                        <TouchableOpacity 
                          key={speed} 
                          onPress={() => handleSpeedSelect(speed)}
                          className={`py-2 px-3 ${playbackRate === speed ? 'bg-primary-400/30' : ''}`}
                        >
                          <Text className="text-typography-800 text-xs text-center">{speed}x</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {movieId && episodeId && episodeServerId && m3u8Url && (
                  <HStack space="sm">
                    <DownloadButton
                      movieId={movieId}
                      movieName={movieName || 'Unknown Movie'}
                      episodeId={episodeId}
                      episodeName={episodeName || filename || 'Unknown Episode'}
                      episodeServerId={episodeServerId}
                      episodeServerName={episodeServerName || ''}
                      episodeServerFileName={episodeServerFileName || filename || ''}
                      m3u8Url={m3u8Url}
                      thumbUrl={thumbUrl}
                      showText={isFullscreen}
                      size={20}
                    />
                  </HStack>
                )}
              </HStack>

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
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  controlsContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    zIndex: 10,
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
  centerControlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: '40%',
    width: '100%',
    paddingHorizontal: 20,
  },
  centerButton: {
    marginHorizontal: 20,
  },
  seekButton: {
    // Smaller than the center play/pause button
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

export default VideoPlayerControls;