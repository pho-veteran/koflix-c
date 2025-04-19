import { useState, useRef, useEffect, useCallback } from 'react';
import { BackHandler, Animated, Dimensions, Platform } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as NavigationBar from 'expo-navigation-bar';
import { VideoRef, OnProgressData, OnLoadData } from 'react-native-video';

interface UseVideoPlayerOptions {
  onGoBack?: () => Promise<void> | void;
  autoHideControlsTimeout?: number;
}

export function useVideoPlayer(options: UseVideoPlayerOptions = {}) {
  const { 
    onGoBack, 
    autoHideControlsTimeout = 3000 
  } = options;
  
  const isFocused = useIsFocused();
  const videoRef = useRef<VideoRef>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Player states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [videoInfo, setVideoInfo] = useState<{width: number, height: number}>({width: 0, height: 0});
  
  // Handle back button to exit fullscreen or go back
  useEffect(() => {
    const backAction = () => {
      if (isFullscreen) {
        toggleFullscreen();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [isFullscreen]);

  // Handle orientation changes when focus changes
  useEffect(() => {
    if (!isFocused) {
      setIsPlaying(false);
      ScreenOrientation.unlockAsync();
    } else {
      if (isFullscreen) {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      } else {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      }
    }
  }, [isFocused, isFullscreen]);

  // Listen to orientation changes
  useEffect(() => {
    if (!isFocused) return;
    
    const subscription = ScreenOrientation.addOrientationChangeListener(({ orientationInfo }) => {
      const isLandscapeOrientation =
        orientationInfo.orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
        orientationInfo.orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;

      setIsFullscreen(isLandscapeOrientation);
      setShowControls(true);
      
      // Update navigation bar based on orientation
      if (Platform.OS === 'android') {
        NavigationBar.setVisibilityAsync(isLandscapeOrientation ? 'hidden' : 'visible');
      }
    });

    return () => {
      ScreenOrientation.removeOrientationChangeListener(subscription);
    };
  }, [isFocused]);

  // Handle controls fade animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: showControls ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [showControls, fadeAnim]);

  // Auto-hide controls timer
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
        setShowControls(false);
      }, autoHideControlsTimeout);
    }

    return clearTimer;
  }, [showControls, isPlaying, isSeeking, autoHideControlsTimeout]);

  // Handle navigation bar visibility when fullscreen changes
  useEffect(() => {
    if (Platform.OS === 'android') {
      const updateNavigationBar = async () => {
        if (isFullscreen) {
          // Hide navigation bar in fullscreen
          await NavigationBar.setVisibilityAsync('hidden');
        } else {
          // Show navigation bar in normal mode
          await NavigationBar.setVisibilityAsync('visible');
        }
      };
      
      updateNavigationBar();
    }
  }, [isFullscreen]);

  // Ensure we restore the navigation bar on unmount
  useEffect(() => {
    return () => {
      if (Platform.OS === 'android') {
        NavigationBar.setVisibilityAsync('visible');
      }
    };
  }, []);

  // Video player actions
  const toggleFullscreen = useCallback(async () => {
    try {
      if (isFullscreen) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        if (Platform.OS === 'android') {
          await NavigationBar.setVisibilityAsync('visible');
        }
        setIsFullscreen(false);
      } else {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        if (Platform.OS === 'android') {
          await NavigationBar.setVisibilityAsync('hidden');
        }
        setIsFullscreen(true);
      }
    } catch (error) {
      console.error("Error changing orientation:", error);
    }
  }, [isFullscreen]);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const toggleControls = useCallback(() => {
    setShowControls(prev => !prev);
  }, []);

  const handleGoBack = useCallback(async () => {
    await ScreenOrientation.unlockAsync();
    if (Platform.OS === 'android') {
      await NavigationBar.setVisibilityAsync('visible');
    }
    if (onGoBack) await onGoBack();
  }, [onGoBack]);

  const handleProgress = useCallback((data: OnProgressData) => {
    if (!isSeeking) {
      setCurrentTime(data.currentTime);
    }
  }, [isSeeking]);

  const handleLoad = useCallback((data: OnLoadData) => {
    setDuration(data.duration);
    
    if (data.naturalSize) {
      setVideoInfo({
        width: data.naturalSize.width,
        height: data.naturalSize.height
      });
    }
    
    setIsLoading(false);
  }, []);

  const handleSeek = useCallback((progress: number) => {
    const newTime = progress * duration;
    setCurrentTime(newTime);

    if (videoRef.current) {
      videoRef.current.seek(newTime);
    }
  }, [duration]);

  const seekBySeconds = useCallback((seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    setCurrentTime(newTime);
    
    if (videoRef.current) {
      videoRef.current.seek(newTime);
    }
  }, [currentTime, duration]);

  const formatTime = useCallback((timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }, []);

  const handleSeekFromEvent = useCallback((locationX: number) => {
    const { width } = Dimensions.get('window');
    const progress = locationX / width;
    handleSeek(Math.max(0, Math.min(1, progress)));
  }, [handleSeek]);

  return {
    // Refs
    videoRef,
    fadeAnim,
    
    // States
    isLoading,
    setIsLoading,
    error,
    setError,
    isPlaying,
    setIsPlaying,
    isFullscreen,
    setIsFullscreen,
    showControls,
    setShowControls,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    isSeeking,
    setIsSeeking,
    videoInfo,
    
    // Actions
    toggleFullscreen,
    togglePlay,
    toggleControls,
    handleGoBack,
    handleProgress,
    handleLoad,
    handleSeek,
    handleSeekFromEvent,
    formatTime,
    seekBySeconds,
    isFocused,
  };
}