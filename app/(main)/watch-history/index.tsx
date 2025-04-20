import React, { useEffect, useState } from "react";
import { View, FlatList, RefreshControl, StatusBar as RNStatusBar, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  NETFLIX_RED,
  LOADING
} from "@/constants/ui-constants";
import { getWatchHistory } from "@/api/user-movie";
import { EpisodeWatchHistory } from "@/types/user-movie-type";
import { useIsFocused } from "@react-navigation/native";

// Import components
import WatchHistoryHeader from "./components/watch-history-header";
import WatchHistoryItem from "./components/watch-history-item";
import EmptyState from "./components/empty-state";
import LoadingState from "./components/loading-state";
import ErrorState from "./components/error-state";
import ListFooter from "./components/list-footer";

const ITEMS_PER_PAGE = 15;
const WATCH_HISTORY_HEADER_HEIGHT = 60;

export default function WatchHistoryPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isFocused = useIsFocused();

  const [watchHistory, setWatchHistory] = useState<EpisodeWatchHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");

  const fetchWatchHistory = async (page = 1, refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      setError("");
      const history = await getWatchHistory(page, ITEMS_PER_PAGE);

      if (history) {
        if (page === 1) {
          setWatchHistory(history.data);
        } else {
          setWatchHistory(prev => [...prev, ...history.data]);
        }

        setTotalPages(history.pagination.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching watch history:", error);
      setError("Không thể tải lịch sử xem. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    fetchWatchHistory(1, true);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !isLoadingMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchWatchHistory(nextPage);
    }
  };

  useEffect(() => {
    RNStatusBar.setBarStyle('light-content');
    if (isFocused) {
      fetchWatchHistory(1);
    }
  }, [isFocused]);

  const navigateToEpisode = (item: EpisodeWatchHistory) => {
    if (item.movie?.id && item.episodeServer?.episode?.id && item.episodeServer.id) {
      router.push(
        `/movie/${item.movie.id}/episode/${item.episodeServer.episode.id}?serverId=${item.episodeServer.id}`
      );
    }
  };

  const handleExplorePress = () => {
    router.push("/(main)/(tabs)/profile");
  };

  const handleBackPress = () => {
    router.back();
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (!isFocused) {
    return null;
  }

  if (error) {
    return (
      <View className="flex-1 bg-secondary-100 justify-center items-center p-6">
        <StatusBar style="light" />
        <ErrorState error={error} onRetry={handleRefresh} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      <WatchHistoryHeader onBackPress={handleBackPress} />
      <View className="mx-4">
        <FlatList
          data={watchHistory}
          renderItem={({ item }) => (
            <WatchHistoryItem
              item={item}
              onPress={navigateToEpisode}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingTop: WATCH_HISTORY_HEADER_HEIGHT + insets.top + 10,
            paddingBottom: 40,
            flexGrow: watchHistory.length === 0 ? 1 : undefined,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={NETFLIX_RED}
              colors={[NETFLIX_RED]}
              progressBackgroundColor={LOADING.REFRESH_BACKGROUND}
              progressViewOffset={WATCH_HISTORY_HEADER_HEIGHT + insets.top}
            />
          }
          ListEmptyComponent={<EmptyState onExplore={handleExplorePress} />}
          ListFooterComponent={<ListFooter isLoadingMore={isLoadingMore} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.2}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          showsVerticalScrollIndicator={false}
        />
      </View>


      {isRefreshing && (
        <View
          className="absolute top-0 left-0 right-0 flex-row justify-center"
          style={{ top: WATCH_HISTORY_HEADER_HEIGHT + insets.top + 10 }}
        >
          <View className="bg-secondary-100/80 px-4 py-2 rounded-full">
            <Text className="text-typography-950 text-xs">Đang cập nhật...</Text>
          </View>
        </View>
      )}
    </View>
  );
}