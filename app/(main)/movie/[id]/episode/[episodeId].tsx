import React, { useEffect, useState } from "react";
import {
  View,
  StatusBar,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { getMovieDetail } from "@/api/movies";
import { VStack } from "@/components/ui/vstack";
import { Episode, MovieDetail, EpisodeServer } from "@/types/movie-type";
import EpisodeSelectorModal from "@/components/modals/episode-selector-modal";
import { useAuth } from "@/providers/auth-context";
import { NETFLIX_RED } from "@/constants/ui-constants";
import Animated, { FadeIn } from 'react-native-reanimated';
import { useVideoPlayer } from '@/hooks/use-video-player';

// Components
import VideoPlayer from "./components/video-player";
import EpisodeTitle from "./components/episode-title";
import EpisodeNavigation from "./components/episode-navigation";
import ServerSelector from "./components/server-selector";
import { CommentList } from "@/components/comments";

export default function EpisodePlayerScreen() {
  const { id, episodeId } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const isFocused = useIsFocused();
  
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [selectedServer, setSelectedServer] = useState<EpisodeServer | null>(null);
  const [isEpisodeModalOpen, setIsEpisodeModalOpen] = useState(false);
  const [previousPlayingState, setPreviousPlayingState] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1.0); // Add playback rate state

  // Initialize the video player hook
  const videoPlayerHook = useVideoPlayer({
    onGoBack: async () => {
      router.back();
    }
  });

  const {
    isFullscreen,
    setIsFullscreen,
    isPlaying, 
    setIsPlaying,
    showControls,
    setShowControls,
    setIsLoading: setIsVideoLoading,
    error: videoError,
    setError: setVideoError,
    isLoading: isVideoLoading
  } = videoPlayerHook;

  // Pause video when episode modal is opened
  useEffect(() => {
    if (isEpisodeModalOpen) {
      // Save the current playing state *before* pausing
      setPreviousPlayingState(isPlaying);
      // Always pause when the modal opens
      setIsPlaying(false);
    }
  }, [isEpisodeModalOpen, isPlaying, setIsPlaying]); // Keep dependencies, but logic changed

  // Hide control when loading
  useEffect(() => {
    if (isVideoLoading) {
      setShowControls(false);
    }
  }, [isVideoLoading, setShowControls]);

  // Load movie and episode data
  useEffect(() => {
    let isMounted = true;
    
    async function fetchData() {
      if (!id || !isFocused) return;

      try {
        const movieData = await getMovieDetail(id as string, user?.id);
        if (!isMounted) return;
        
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

    if (isFocused) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [id, episodeId, isFocused, user?.id]);

  const handleVideoLoaded = () => {
    setIsVideoLoading(false);
    setShowControls(true);
    
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  };

  const handleEpisodeSelect = (episode: Episode) => {
    if (id && episode.id !== episodeId) {
      router.replace(`/movie/${id}/episode/${episode.id}`);
    }
    setIsEpisodeModalOpen(false);
  };

  const handleServerSelect = (server: EpisodeServer) => {
    setSelectedServer(server);
    setIsVideoLoading(true);
    setVideoError("");
  };

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

    if (targetIndex !== currentIndex) {
      handleEpisodeSelect(movie.episodes[targetIndex]);
    }
  };

  // If not focused, don't render anything (unmount component)
  if (!isFocused) {
    return null;
  }

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
        videoPlayerHook={videoPlayerHook}
        onOpenEpisodeModal={() => setIsEpisodeModalOpen(true)}
        onVideoLoaded={handleVideoLoaded}
        movieId={movie.id}
        movieName={movie.name}
        episodeId={currentEpisode.id}
        episodeName={currentEpisode.name}
        posterUrl={movie.poster_url}
        thumbUrl={movie.thumb_url}
        playbackRate={playbackRate}
        onChangePlaybackRate={setPlaybackRate}
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
              
              {/* Comments Section */}
              <View className="mt-4">
                <CommentList 
                  episodeId={currentEpisode.id} 
                  movieId={movie.id}
                />
              </View>
            </VStack>
          </Animated.View>
        </ScrollViewComponent>
      )}

      {/* Episode Selector Modal */}
      {isFocused && (
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
      )}
    </View>
  );
}