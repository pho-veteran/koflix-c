import React, { useEffect, useState } from "react";
import { View, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui/text";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getMovieDetail } from "@/api/movies";
import { MovieDetail, Episode, MovieBase, UserInteractionData } from "@/types/movie";
import { NETFLIX_RED } from "@/constants/ui-constants";
import { VStack } from "@/components/ui/vstack";
import EpisodeSelectorModal from "@/components/modals/episode-selector-modal";
import MovieSection from "@/components/movies/movie-section";
import { getSimilarMovies } from "@/api/recommendations";
import { useAuth } from "@/providers/auth-context";

import {
  MovieHero,
  MovieActions,
  MovieInfo,
  MovieGenres,
  MovieInteractions,
  MovieSynopsis,
  MovieDetails,
  MovieTrailer
} from "./components";

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [similarMovies, setSimilarMovies] = useState<MovieBase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [movieInteraction, setMovieInteraction] = useState<UserInteractionData | null>(null);

  const [isEpisodeModalOpen, setIsEpisodeModalOpen] = useState(false);

  useEffect(() => {
    async function fetchMovieDetails() {
      if (!id) return;

      try {
        setIsLoading(true);
        const movieData = await getMovieDetail(
          id as string,
          user?.id
        );
        setMovie(movieData);

        if (movieData.userInteraction) {
          setMovieInteraction(movieData.userInteraction);
        }

        try {
          const similar = await getSimilarMovies(id as string);
          setSimilarMovies(similar);
        } catch (similarErr) {
          console.error("Error fetching similar movies:", similarErr);
        }

        setError("");
      } catch (err) {
        console.error("Error fetching movie details:", err);
        setError("Không thể tải thông tin phim. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchMovieDetails();
  }, [id]);

  const handleGoBack = () => {
    router.back();
  };

  const handleOpenEpisodeModal = () => {
    setIsEpisodeModalOpen(true);
  };

  const handleEpisodeSelect = (episode: Episode) => {
    router.push(`/movie/${id}/episode/${episode.id}`);
  };

  const handleInteractionUpdate = (newInteraction: UserInteractionData) => {
    setMovieInteraction(newInteraction);

    if (movie) {
      setMovie({
        ...movie,
        userInteraction: newInteraction
      });
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={NETFLIX_RED} />
      </View>
    );
  }

  if (error || !movie) {
    return (
      <View className="flex-1 bg-secondary-100 justify-center items-center p-6">
        <StatusBar style="light" />
        <View className="bg-secondary-200/80 p-6 rounded-xl border border-secondary-300 w-full max-w-md items-center">
          <Text className="text-error-400 text-lg font-bold text-center mb-3">
            {error || "Không tìm thấy phim"}
          </Text>
          <Text className="text-typography-600 text-center mb-6">
            Vui lòng kiểm tra kết nối internet và thử lại.
          </Text>
          <TouchableOpacity
            className="bg-primary-400 px-5 py-3 rounded-md"
            onPress={handleGoBack}
            activeOpacity={0.8}
          >
            <Text className="text-typography-950 font-medium">
              Quay lại
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />

      {/* Back Button */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: insets.top + 10,
          left: 10,
          zIndex: 50,
          backgroundColor: 'rgba(0,0,0,0.5)',
          width: 40,
          height: 40,
          borderRadius: 20,
          justifyContent: 'center',
          alignItems: 'center'
        }}
        onPress={handleGoBack}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <ScrollView className="flex-1">
        {/* Hero Section */}
        <MovieHero
          thumbUrl={movie.thumb_url}
          status={movie.status}
          chieurap={movie.chieurap}
          tmdb={movie.tmdb}
        />

        {/* Action Buttons */}
        <MovieActions
          onOpenEpisodeModal={handleOpenEpisodeModal}
        />

        {/* Movie Info */}
        <VStack className="px-4 pt-3 pb-10" space="md">
          {/* Basic Info */}
          <MovieInfo
            name={movie.name}
            originName={movie.origin_name}
            year={movie.year}
            quality={movie.quality}
            time={movie.time}
            episodeCurrent={movie.episode_current}
            episodeTotal={movie.episode_total}
          />

          {/* Genres */}
          <MovieGenres genres={movie.genres} />

          {/* Interactions */}
          <MovieInteractions
            movieId={movie.id}
            rating={movie.rating}
            ratingCount={movie.ratingCount}
            viewCount={movie.view}
            likeCount={movie.likeCount}
            userInteraction={movieInteraction}
            onInteractionUpdate={handleInteractionUpdate}
          />

          {/* Add trailer component here if movie has trailer */}
          {movie.trailer_url && (
            <MovieTrailer
              trailerUrl={movie.trailer_url}
              title={movie.name}
            />
          )}

          {/* Synopsis */}
          <MovieSynopsis content={movie.content} />

          {/* Details */}
          <MovieDetails
            countries={movie.country}
            categories={movie.category}
            directors={movie.director}
            actors={movie.actor}
          />
          {/* Similar Movies Section */}
          {similarMovies.length > 0 && (
            <View className="mb-8">
              <MovieSection
                title="Phim tương tự"
                movies={similarMovies}
                emptyText="Không có phim tương tự nào"
              />
            </View>
          )}
        </VStack>
      </ScrollView>

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
      />
    </View>
  );
}