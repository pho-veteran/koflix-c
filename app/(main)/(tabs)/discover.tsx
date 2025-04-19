import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, ScrollView, RefreshControl, TouchableOpacity, StatusBar as RNStatusBar } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HomeHeader from "@/components/layout/home-header";
import { getRecentlyAddedMovies, getTrendingMovies, getGenreTrending, getTypeTrending, getRecentGenre, getRecentType } from "@/api/recommendations";
import { MovieBase } from "@/types/movie-type";
import FeaturedCarousel from "@/components/movies/featured-carousel";
import { HEADER_HEIGHT, LOADING, NETFLIX_RED, TEXT_STYLING, APP_NAME } from "@/constants/ui-constants";
import DiscoverModal from "@/components/modals/discover-modal";
import { Ionicons } from "@expo/vector-icons";
import ThumbnailSection from "@/components/movies/thumbnail-section";

export default function DiscoverPage() {
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'genre' | 'type' | null>(null);
  const [filterName, setFilterName] = useState<string>("");
  const [recentMovies, setRecentMovies] = useState<MovieBase[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<MovieBase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchMovies = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      if (!selectedFilter || !filterType) {
        // Default view - general trending and recent
        const [recent, trending] = await Promise.all([
          getRecentlyAddedMovies(20),
          getTrendingMovies(),
        ]);
        setRecentMovies(recent);
        setTrendingMovies(trending);
      } else {
        // Filter-specific movies
        let trendingFiltered;
        let recentFiltered;

        if (filterType === 'genre') {
          [trendingFiltered, recentFiltered] = await Promise.all([
            getGenreTrending({ genreId: selectedFilter }, 20),
            getRecentGenre(selectedFilter, 20)
          ]);
        } else {
          [trendingFiltered, recentFiltered] = await Promise.all([
            getTypeTrending({ typeId: selectedFilter }, 20),
            getRecentType(selectedFilter, 20)
          ]);
        }

        setTrendingMovies(trendingFiltered);
        setRecentMovies(recentFiltered);
      }

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

  const handleFilterSelect = (id: string, name: string, type: 'genre' | 'type') => {
    setSelectedFilter(id);
    setFilterType(type);
    setFilterName(name);
  };

  const handleFilterUnselect = () => {
    setSelectedFilter(null);
    setFilterType(null);
    setFilterName("");
  };

  useEffect(() => {
    RNStatusBar.setBarStyle('light-content');
    fetchMovies();

    return () => {
      setTrendingMovies([]);
      setRecentMovies([]);
    };
  }, [selectedFilter, filterType]);

  const FilterButton = () => (
    <TouchableOpacity
      className="flex-row items-center bg-secondary-200/50 rounded-full px-3 py-1.5"
      onPress={() => setIsModalVisible(true)}
    >
      <Ionicons name="filter" size={16} color="#fff" />
      <Text className="text-white text-sm ml-1">
        {selectedFilter ? filterName : "Khám phá phim"}
      </Text>
      {selectedFilter && (
        <View className="ml-2 w-2 h-2 rounded-full bg-primary-400" />
      )}
    </TouchableOpacity>
  );

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
      <StatusBar style="light" />
      <HomeHeader rightElement={<FilterButton />} />

      <DiscoverModal
        visible={isModalVisible}
        onClose={setIsModalVisible.bind(null, false)}
        onSelect={handleFilterSelect}
        onUnselect={handleFilterUnselect}
        hasActiveFilter={!!selectedFilter}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT + insets.top,
          paddingBottom: 60,
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
        {selectedFilter ? (
          <>
            {/* Featured carousel with filtered trending movies */}
            {trendingMovies.length > 0 && (
              <FeaturedCarousel
                movies={trendingMovies.slice(0, 3)}
                isRefreshing={isRefreshing}
              />
            )}

            <VStack space="md" className="px-4 mb-6 mt-4">
              <ThumbnailSection
                title={`Phim hot của ${filterName}`}
                movies={trendingMovies}
                emptyText={`Không tìm thấy phim hot nào cho ${filterName}.`}
              />

              <ThumbnailSection
                title="Mới cập nhật"
                movies={recentMovies}
                emptyText="Không có phim mới cập nhật."
                columns={1}
              />
            </VStack>
          </>
        ) : (
          <View className="px-4 mb-6">
            <ThumbnailSection
              title="Khám phá phim"
              movies={recentMovies}
              emptyText="Không có phim nào."
              columns={2}
            />
          </View>
        )}
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