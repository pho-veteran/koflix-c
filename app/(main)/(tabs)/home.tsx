import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, RefreshControl, StatusBar as RNStatusBar, TouchableOpacity, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useAuth } from "@/providers/auth-context";
import { 
  getTrendingMovies, 
  getRecentlyAddedMovies, 
  getRecommendedMovies,
  getRecentLiked,
  getRecentWatched
} from "@/api/recommendations";
import { MovieBase } from "@/types/movie-type";
import PosterSection from "@/components/movies/poster-section";
import ThumbnailSection from "@/components/movies/thumbnail-section";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Header from "@/components/layout/home-header";
import FeaturedCarousel from "@/components/movies/featured-carousel";
import {
  HEADER_HEIGHT,
  NETFLIX_RED,
  TEXT_STYLING,
  LOADING,
  APP_NAME
} from "@/constants/ui-constants";

export default function HomePage() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [trendingMovies, setTrendingMovies] = useState<MovieBase[]>([]);
  const [recentMovies, setRecentMovies] = useState<MovieBase[]>([]);
  const [recommendedMovies, setRecommendedMovies] = useState<MovieBase[]>([]);
  const [recentlyLikedMovies, setRecentlyLikedMovies] = useState<MovieBase[]>([]);
  const [recentlyWatchedMovies, setRecentlyWatchedMovies] = useState<MovieBase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchMovies = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      // Execute all requests in parallel
      const [trending, recent, recommended, recentlyLiked, recentlyWatched] = await Promise.all([
        getTrendingMovies(),
        getRecentlyAddedMovies(24),
        getRecommendedMovies(),
        getRecentLiked(),
        getRecentWatched()
      ]);

      setTrendingMovies(trending);
      setRecentMovies(recent);
      setRecommendedMovies(recommended);
      setRecentlyLikedMovies(recentlyLiked);
      setRecentlyWatchedMovies(recentlyWatched);
      setError("");
    } catch (err) {
      console.error("Error fetching movies:", err);
      setError("Không thể tải phim. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchMovies(true);
  };

  useEffect(() => {
    RNStatusBar.setBarStyle('light-content');
    fetchMovies();

    return () => {
      setTrendingMovies([]);
      setRecentMovies([]);
      setRecommendedMovies([]);
      setRecentlyLikedMovies([]);
      setRecentlyWatchedMovies([]);
    };
  }, [user?.id]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-secondary-100 justify-center items-center">
        <StatusBar style="light" />
        <Text
          className="text-primary-400 font-bold text-3xl tracking-tighter mb-8"
          style={{
            textShadowColor: TEXT_STYLING.SHADOW_COLOR,
            textShadowOffset: TEXT_STYLING.SHADOW_OFFSET,
            textShadowRadius: TEXT_STYLING.SHADOW_RADIUS
          }}
        >
          {APP_NAME}
        </Text>
        <ActivityIndicator size="large" color={LOADING.INDICATOR_COLOR} />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-secondary-100 justify-center items-center p-6">
        <StatusBar style="light" />
        <Text
          className="text-primary-400 font-bold text-3xl tracking-tighter mb-8"
          style={{
            textShadowColor: TEXT_STYLING.SHADOW_COLOR,
            textShadowOffset: TEXT_STYLING.SHADOW_OFFSET,
            textShadowRadius: TEXT_STYLING.SHADOW_RADIUS
          }}
        >
          {APP_NAME}
        </Text>
        <View className="bg-secondary-200/80 p-6 rounded-xl border border-secondary-300 w-full max-w-md items-center">
          <Text className="text-error-400 text-lg font-bold text-center mb-3">{error}</Text>
          <Text className="text-typography-600 text-center mb-6">
            Vui lòng kiểm tra kết nối internet và thử lại.
          </Text>
          <TouchableOpacity
            className="bg-primary-400 px-5 py-3 rounded-md"
            onPress={() => fetchMovies()}
            activeOpacity={0.8}
          >
            <Text className="text-typography-950 font-medium">
              Thử lại
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* Custom Header with standard scrollPosition */}
      <Header />

      {/* Main content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT + insets.top,
          paddingBottom: 60
        }}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={NETFLIX_RED}
            colors={[NETFLIX_RED]}
            progressBackgroundColor={LOADING.REFRESH_BACKGROUND}
            progressViewOffset={HEADER_HEIGHT + insets.top}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <StatusBar style="light" />

        {/* Featured Carousel with Parallax */}
        <FeaturedCarousel
          movies={trendingMovies}
          isRefreshing={isRefreshing}
        />

        <VStack space="md" className="px-4 mb-6">
          {/* Recommended For You Section */}
          {user?.id && recommendedMovies.length > 0 && (
            <PosterSection
              title="Đề Xuất Cho Bạn"
              movies={recommendedMovies}
              emptyText="Đang xây dựng đề xuất cho bạn..."
            />
          )}

          {/* Because You Watched Section */}
          {user?.id && recentlyWatchedMovies.length > 0 && (
            <PosterSection
              title="Vì Bạn Đã Xem"
              movies={recentlyWatchedMovies}
              emptyText="Xem thêm phim để nhận đề xuất tốt hơn..."
            />
          )}

          {/* Because You Liked Section */}
          {user?.id && recentlyLikedMovies.length > 0 && (
            <PosterSection
              title="Vì Bạn Đã Thích"
              movies={recentlyLikedMovies}
              emptyText="Thích thêm phim để nhận đề xuất tốt hơn..."
            />
          )}

          {/* Recently Added Section - Using ThumbnailSection */}
          <ThumbnailSection
            title="Mới Cập Nhật"
            movies={recentMovies}
            emptyText="Không có phim mới cập nhật."
            columns={1}
          />
        </VStack>
      </ScrollView>

      {/* Loading overlay for refresh state */}
      {isRefreshing && (
        <View
          className="absolute top-0 left-0 right-0 flex-row justify-center"
          style={{ top: HEADER_HEIGHT + insets.top + 10 }}
        >
          <View className="bg-secondary-100/80 px-4 py-2 rounded-full">
            <Text className="text-typography-950 text-xs">Đang cập nhật...</Text>
          </View>
        </View>
      )}
    </View>
  );
}