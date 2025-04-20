import React, { useEffect, useState, useRef } from "react";
import { View, StatusBar, ActivityIndicator, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { getMovieDetail } from "@/api/movies";
import { trackMovieView, saveWatchProgress, getEpisodeWatchHistory } from "@/api/user-movie";
import { VStack } from "@/components/ui/vstack";
import { Episode, MovieDetail, EpisodeServer } from "@/types/movie-type";
import EpisodeSelectorModal from "@/components/modals/episode-selector-modal";
import ConfirmationModal from "@/components/modals/confirmation-modal";
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
  const { id, episodeId, serverId } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const isFocused = useIsFocused();

  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [selectedServer, setSelectedServer] = useState<EpisodeServer | null>(null);
  const [isEpisodeModalOpen, setIsEpisodeModalOpen] = useState(false);
  const [previousPlayingState, setPreviousPlayingState] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  
  // Resume watch state
  const [resumeData, setResumeData] = useState<{
    progress: number;
    time: number;
    serverId: string;
  } | null>(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  
  // View tracking reference
  const viewTracked = useRef(false);
  const minimumWatchTimeForView = 60;

  // Initialize the video player hook
  const videoPlayerHook = useVideoPlayer({
    onGoBack: async () => {
      saveProgressImmediate();
      router.back();
    }
  });

  const {
    isFullscreen,
    isPlaying,
    setIsPlaying,
    setShowControls,
    setIsLoading: setIsVideoLoading,
    setError: setVideoError,
    isLoading: isVideoLoading,
    duration,
    currentTime,
    formatTime,
  } = videoPlayerHook;

  // Fetch watch history function
  const fetchWatchHistory = async (epId: string) => {
    if (!epId || !user?.id || !selectedServer) return;
    
    try {
      const historyData = await getEpisodeWatchHistory(epId);
      
      if (historyData?.success && historyData.data?.watchHistory?.length > 0) {
        // Filter to only get history for the currently selected server
        const serverHistory = historyData.data.watchHistory.filter(
          item => item.episodeServerId === selectedServer.id
        );
        
        if (serverHistory.length > 0) {
          // Find the most recent watch history item for this server
          const mostRecent = serverHistory.reduce(
            (latest, current) => {
              return new Date(latest.watchedAt) > new Date(current.watchedAt) 
                ? latest 
                : current;
            }
          );
          
          // Only prompt to resume if progress is between 5% and 95%
          if (mostRecent.progress >= 5 && mostRecent.progress < 95) {
            setResumeData({
              progress: mostRecent.progress,
              time: mostRecent.durationWatched,
              serverId: mostRecent.episodeServerId
            });
            setShowResumeModal(true);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching watch history:", error);
    }
  };

  // Save progress function
  const saveProgressImmediate = () => {
    if (!movie?.id || !selectedServer?.id || !currentEpisode?.id || duration <= 0) return;

    const progressPercent = (currentTime / duration) * 100;

    // Only save if we've watched more than 10 seconds
    if (currentTime > 10) {
      saveWatchProgress(
        movie.id,
        selectedServer.id,
        progressPercent,
        currentTime
      ).catch(error => {
        console.error("Error saving watch progress:", error);
      });
    }
  };

  // Resume handlers
  const handleResumeConfirm = () => {
    if (!resumeData || !videoPlayerHook.videoRef.current || !selectedServer) return;
    
    // Only resume if the current server matches the resume data
    if (resumeData.serverId === selectedServer.id) {
      const timeToSeek = (resumeData.progress / 100) * duration || resumeData.time;
      if (timeToSeek > 0 && videoPlayerHook.videoRef.current) {
        videoPlayerHook.videoRef.current.seek(timeToSeek);
      }
    }
    
    setShowResumeModal(false);
  };

  const handleResumeCancel = () => {
    setShowResumeModal(false);
    setResumeData(null);
  };

  // Pause video when episode modal is opened
  useEffect(() => {
    if (isEpisodeModalOpen) {
      setPreviousPlayingState(isPlaying);
      setIsPlaying(false);
    }
  }, [isEpisodeModalOpen, isPlaying, setIsPlaying]);

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

          // Select server based on serverId param or use first server
          if (episode.servers && episode.servers.length > 0) {
            if (serverId) {
              const requestedServer = episode.servers.find(server => String(server.id) === String(serverId));
              
              if (requestedServer) {
                setSelectedServer(requestedServer);
              } else {
                setSelectedServer(episode.servers[0]);
              }
            } else {
              setSelectedServer(episode.servers[0]);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching movie/episode details:", err);
      }
    }

    if (isFocused) {
      fetchData();
    }

    if (!isFocused) {
      saveProgressImmediate();
    }

    return () => {
      isMounted = false;      
    };
  }, [id, episodeId, serverId, isFocused, user?.id]);

  // Add an effect to fetch watch history when the selected server changes
  useEffect(() => {
    if (currentEpisode?.id && user?.id && selectedServer) {
      fetchWatchHistory(currentEpisode.id);
    }
  }, [selectedServer, currentEpisode?.id, user?.id]);

  const handleVideoLoaded = () => {
    setIsVideoLoading(false);
    setShowControls(true);

    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => clearTimeout(timer);
  };

  const handleVideoProgress = (data: any) => {
    // Call the original progress handler from the hook
    videoPlayerHook.handleProgress(data);

    // View track
    if (!viewTracked.current &&
      data.currentTime >= minimumWatchTimeForView &&
      movie?.id) {

      viewTracked.current = true;

      trackMovieView(movie.id);
    }
  };

  const handleEpisodeSelect = (episode: Episode) => {
    // Save current progress before switching
    saveProgressImmediate();

    if (id && episode.id !== episodeId) {
      // If we have a selected server, maintain server selection pattern across episodes when possible
      if (selectedServer) {
        const preferredServerName = selectedServer.server_name;
        // Try to find a server with the same name in the new episode
        const matchingServer = episode.servers?.find(server => server.server_name === preferredServerName);
        
        if (matchingServer) {
          router.replace(`/movie/${id}/episode/${episode.id}?serverId=${matchingServer.id}`);
        } else {
          router.replace(`/movie/${id}/episode/${episode.id}`);
        }
      } else {
        router.replace(`/movie/${id}/episode/${episode.id}`);
      }
    }
    setIsEpisodeModalOpen(false);
  };

  // Handle server selection
  const handleServerSelect = (server: EpisodeServer) => {
    // Save current progress before switching
    saveProgressImmediate();

    // Update URL to include selected server for better history tracking
    if (id && episodeId) {
      router.replace(`/movie/${id}/episode/${episodeId}?serverId=${server.id}`);
    }
    
    setSelectedServer(server);
    setIsVideoLoading(true);
    setVideoError("");
  };

  const navigateToEpisode = (direction: 'prev' | 'next') => {
    if (!movie?.episodes?.length || !currentEpisode) return;

    // Save progress before navigation
    saveProgressImmediate();

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

  // If not focused, unmount
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
        videoPlayerHook={{
          ...videoPlayerHook,
          handleProgress: handleVideoProgress,
        }}
        onOpenEpisodeModal={() => setIsEpisodeModalOpen(true)}
        onVideoLoaded={handleVideoLoaded}
        movieId={movie?.id}
        movieName={movie?.name}
        episodeId={currentEpisode?.id}
        episodeName={currentEpisode?.name}
        posterUrl={movie?.poster_url}
        thumbUrl={movie?.thumb_url}
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

      {/* Resume Playback Modal */}
      {isFocused && resumeData && (
        <ConfirmationModal
          isOpen={showResumeModal}
          onClose={handleResumeCancel}
          onConfirm={handleResumeConfirm}
          confirmationType="info"
          title="Tiếp tục xem"
          message={`Bạn muốn tiếp tục xem từ ${formatTime((resumeData.progress / 100) * duration || resumeData.time)}?`}
          confirmText="Tiếp tục xem"
        />
      )}
    </View>
  );
}