import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StatusBar,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Platform
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ScreenOrientation from 'expo-screen-orientation';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getMovieDetail } from "@/api/movies";
import { VStack } from "@/components/ui/vstack";
import { Episode, MovieDetail, EpisodeServer } from "@/types/movie";
import EpisodeSelectorModal from "@/components/modals/episode-selector-modal";
import { useAuth } from "@/providers/auth-context";
import { NETFLIX_RED } from "@/constants/ui-constants";
import Animated, { FadeIn } from 'react-native-reanimated';

// Components
import VideoPlayer from "./components/video-player";
import EpisodeTitle from "./components/episode-title";
import EpisodeNavigation from "./components/episode-navigation";
import ServerSelector from "./components/server-selector";

export default function EpisodePlayerScreen() {
  const { id, episodeId } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [selectedServer, setSelectedServer] = useState<EpisodeServer | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState("");
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isEpisodeModalOpen, setIsEpisodeModalOpen] = useState(false);
  const [previousPlayingState, setPreviousPlayingState] = useState(true);

  // Pause video when episode modal is opened
  useEffect(() => {
    if (isEpisodeModalOpen) {
      setPreviousPlayingState(isPlaying);
      setIsPlaying(false);
    } else if (!isEpisodeModalOpen && previousPlayingState) {
      setIsPlaying(true);
    }
  }, [isEpisodeModalOpen]);

  // Load movie and episode data
  useEffect(() => {
    async function fetchData() {
      if (!id) return;

      try {
        const movieData = await getMovieDetail(id as string, user?.id);
        setMovie(movieData);

        if (movieData.episodes && movieData.episodes.length > 0) {
          // Find current episode or use the first one
          const episode = movieData.episodes.find(ep => ep.id === episodeId) || movieData.episodes[0];
          setCurrentEpisode(episode);

          // Select first server if available
          if (episode.servers && episode.servers.length > 0) {
            setSelectedServer(episode.servers[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching movie/episode details:", err);
      }
    }

    fetchData();

    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);

    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, [id, episodeId]);

  // Handle video orientation changes
  const toggleFullscreen = async () => {
    try {
      if (isFullscreen) {
        // Go back to portrait
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        setIsFullscreen(false);
      } else {
        // Go to landscape
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        setIsFullscreen(true);
      }
    } catch (error) {
      console.error("Error changing orientation:", error);
    }
  };

  // Listen to orientation changes
  useEffect(() => {
    const subscription = ScreenOrientation.addOrientationChangeListener(({ orientationInfo }) => {
      const isLandscapeOrientation =
        orientationInfo.orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
        orientationInfo.orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;

      setIsFullscreen(isLandscapeOrientation);

      // Hide controls after orientation change
      setShowControls(true);
    });

    return () => {
      ScreenOrientation.removeOrientationChangeListener(subscription);
    };
  }, []);

  // Handle touch on video to show/hide controls
  const handleVideoPress = () => {
    setShowControls(prevShowControls => !prevShowControls);
  };

  // Toggle play/pause
  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
    setShowControls(true);
  };

  // Select episode handler
  const handleEpisodeSelect = (episode: Episode) => {
    if (id && episode.id !== episodeId) {
      router.replace(`/movie/${id}/episode/${episode.id}`);
    }
    setIsEpisodeModalOpen(false);
  };

  // Select server handler
  const handleServerSelect = (server: EpisodeServer) => {
    setSelectedServer(server);
    setIsVideoLoading(true);
    setVideoError("");
  };

  // Navigation between episodes
  const navigateToEpisode = (direction: 'prev' | 'next') => {
    if (!movie?.episodes?.length || !currentEpisode) return;

    const currentIndex = movie.episodes.findIndex(ep => ep.id === currentEpisode.id);
    if (currentIndex === -1) return;

    let targetIndex: number;
    if (direction === 'prev') {
      targetIndex = currentIndex > 0 ? currentIndex - 1 : currentIndex;
    } else {
      targetIndex = currentIndex < movie.episodes.length - 1 ? currentIndex + 1 : currentIndex;
    }

    // If we can navigate, go to the new episode
    if (targetIndex !== currentIndex) {
      handleEpisodeSelect(movie.episodes[targetIndex]);
    }
  };

  // Go back handler
  const handleGoBack = async () => {
    await ScreenOrientation.unlockAsync();
    router.back();
  };

  if (!movie || !currentEpisode) {
    return (
      <View className="flex-1 bg-secondary-100 justify-center items-center">
        <StatusBar hidden={isFullscreen} />
        <ActivityIndicator size="large" color={NETFLIX_RED} />
      </View>
    );
  }

  // Current episode number and whether navigation is possible
  const currentIndex = movie.episodes.findIndex(ep => ep.id === currentEpisode.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < movie.episodes.length - 1;

  const ScrollViewComponent = isFullscreen ? View : ScrollView;

  return (
    <View style={[
      { flex: 1, backgroundColor: '#0c0c0e' },
      !isFullscreen && { paddingTop: insets.top + 10 }
    ]}>
      <StatusBar hidden={isFullscreen} />

      {/* Video Player Component */}
      <VideoPlayer
        selectedServer={selectedServer}
        isFullscreen={isFullscreen}
        isVideoLoading={isVideoLoading}
        isPlaying={isPlaying}
        videoError={videoError}
        showControls={showControls}
        onVideoPress={handleVideoPress}
        onTogglePlay={handleTogglePlay}
        onToggleFullscreen={toggleFullscreen}
        onGoBack={handleGoBack}
        onOpenEpisodeModal={() => setIsEpisodeModalOpen(true)}
        setIsVideoLoading={setIsVideoLoading}
        setVideoError={setVideoError}
      />

      {/* Content below video - only visible in portrait */}
      {!isFullscreen && (
        <ScrollViewComponent className="flex-1 bg-secondary-100/95">
          <Animated.View entering={FadeIn.duration(300)}>
            <VStack className="p-5">
              {/* Episode Title Component */}
              <EpisodeTitle filename={selectedServer?.filename} />

              {/* Episode Navigation Component */}
              <EpisodeNavigation
                hasPrevious={hasPrevious}
                hasNext={hasNext}
                onNavigatePrev={() => navigateToEpisode('prev')}
                onNavigateNext={() => navigateToEpisode('next')}
                onOpenEpisodeModal={() => setIsEpisodeModalOpen(true)}
              />

              {/* Server Selector Component */}
              <ServerSelector
                servers={currentEpisode.servers || []}
                selectedServer={selectedServer}
                onSelectServer={handleServerSelect}
              />
            </VStack>
          </Animated.View>
        </ScrollViewComponent>
      )}

      {/* Episode Selector Modal */}
      <EpisodeSelectorModal
        isOpen={isEpisodeModalOpen}
        onClose={() => setIsEpisodeModalOpen(false)}
        episodes={movie.episodes}
        movieName={movie.name}
        episodeCurrent={movie.episode_current}
        episodeTotal={movie.episode_total}
        status={movie.status}
        onSelectEpisode={handleEpisodeSelect}
        isFullscreen={isFullscreen}
      />
    </View>
  );
}