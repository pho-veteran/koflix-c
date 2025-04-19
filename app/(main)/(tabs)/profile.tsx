import React, { useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Divider } from "@/components/ui/divider";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NETFLIX_RED, LOADING, HEADER_HEIGHT } from "@/constants/ui-constants";
import { useAuth } from "@/providers/auth-context";
import { getUserDetail } from "@/api/users";
import { getWatchHistory } from "@/api/user-movie";
import { User } from "@/types/user-type";
import { EpisodeWatchHistory } from "@/types/user-movie-type";
import { Alert } from "react-native";
import HomeHeader from "@/components/layout/home-header";
import { useDownload } from "@/providers/download-context";
import { DownloadStatus, DownloadTask } from "@/types/download-type";
import ConfirmationModal from "@/components/modals/confirmation-modal";
import { useIsFocused } from "@react-navigation/native";

const getRoleBadgeConfig = (role?: string) => {
  switch (role) {
    case "ADMIN":
      return {
        bgColor: "bg-primary-400/20",
        textColor: "text-primary-400",
        displayText: "Quản trị viên"
      };
    case "UPLOADER":
      return {
        bgColor: "bg-blue-500/20",
        textColor: "text-blue-500",
        displayText: "Uploader"
      };
    default:
      return {
        bgColor: "bg-green-500/20",
        textColor: "text-green-500",
        displayText: "Người dùng"
      };
  }
};

const ProfilePage = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isFocused = useIsFocused();
  const { logout } = useAuth();
  const { userDownloads } = useDownload();
  const [user, setUser] = useState<User | null>(null);
  const [watchHistory, setWatchHistory] = useState<EpisodeWatchHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recentDownload, setRecentDownload] = useState<DownloadTask | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const fetchUserData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const [userDetails, history] = await Promise.all([
        getUserDetail(),
        getWatchHistory(1, 5)
      ]);

      if (userDetails) {
        setUser(userDetails);
      }

      if (history) {
        setWatchHistory(history.data);
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchUserData();
    }
  }, [isFocused]);

  useEffect(() => {
    const completedDownloads = userDownloads.filter(
      download => download.status === DownloadStatus.COMPLETED
    );

    if (completedDownloads.length > 0) {
      completedDownloads.sort((a, b) => b.createdAt - a.createdAt);
      setRecentDownload(completedDownloads[0]);
    }
  }, [userDownloads]);

  const handleRefresh = () => {
    fetchUserData(true);
  };

  const handleLogout = async () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      setIsModalLoading(true);
      await logout();
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setIsModalLoading(false);
      setShowLogoutModal(false);
    }
  };

  const handleChangeAvatar = () => {
    setShowAvatarModal(true);
  };

  const navigateToWatchHistory = () => {
    Alert.alert("Thông báo", "Tính năng đang được phát triển");
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={NETFLIX_RED} />
      </View>
    );
  }

  if (!isFocused) {
    return null;
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      <HomeHeader />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT + insets.top,
          paddingBottom: 20
        }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={NETFLIX_RED}
            colors={[NETFLIX_RED]}
            progressBackgroundColor={LOADING?.REFRESH_BACKGROUND}
            progressViewOffset={HEADER_HEIGHT + insets.top}
          />
        }
      >
        {/* Profile Header */}
        <VStack className="px-5 pt-6 pb-4">
          <View className="bg-secondary-200/10 rounded-xl p-4 mb-2 border border-outline-200/10">
            <HStack className="items-center">
              {/* Clickable Avatar with role-based border color */}
              <TouchableOpacity
                onPress={handleChangeAvatar}
                className="relative"
              >
                <View
                  className={`w-20 h-20 rounded-full items-center justify-center mr-4 overflow-hidden
                    ${user?.role === "ADMIN" ? "border-2 border-primary-400" :
                      user?.role === "UPLOADER" ? "border-2 border-blue-500" :
                        "border border-outline-200/30"}`}
                >
                  {user?.avatarUrl ? (
                    <Image
                      source={{ uri: user.avatarUrl }}
                      className="w-full h-full rounded-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-full bg-primary-400/30 items-center justify-center">
                      <Text className="text-typography-800 text-3xl font-bold">
                        {user?.name?.charAt(0)?.toUpperCase() || "?"}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Edit indicator */}
                <View className="absolute bottom-0 right-3 bg-primary-300 rounded-full p-1.5 border-2 border-secondary-200">
                  <Ionicons name="pencil" size={12} color="#fff" />
                </View>
              </TouchableOpacity>

              <VStack>
                {/* User name */}
                <Heading size="lg" className="text-typography-800">
                  {user?.name || "Người dùng"}
                </Heading>

                {/* Email/Phone */}
                <HStack className="items-center mt-1">
                  <Ionicons name="mail-outline" size={14} color="#9ca3af" />
                  <Text className="text-typography-600 text-sm ml-1.5">
                    {user?.emailOrPhone || ""}
                  </Text>
                </HStack>

                {/* Role badge */}
                {user?.role && (() => {
                  const { bgColor, textColor, displayText } = getRoleBadgeConfig(user.role);
                  return (
                    <View className={`px-2.5 py-0.5 rounded-full mt-2 self-start ${bgColor}`}>
                      <Text className={`text-xs font-medium ${textColor}`}>
                        {displayText}
                      </Text>
                    </View>
                  );
                })()}
              </VStack>
            </HStack>
          </View>
        </VStack>

        <Divider />

        {/* Recent Watch History */}
        <VStack className="px-5 py-4">
          <HStack className="justify-between items-center mb-3">
            <Heading size="sm" className="text-typography-800">
              Xem gần đây
            </Heading>
            <TouchableOpacity onPress={navigateToWatchHistory}>
              <HStack className="items-center">
                <Text className="text-primary-400 text-sm mr-1">Xem tất cả</Text>
                <Ionicons name="chevron-forward" size={16} color="#f43f5e" />
              </HStack>
            </TouchableOpacity>
          </HStack>

          {watchHistory.length > 0 ? (
            <VStack space="sm">
              {watchHistory.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  className="bg-secondary-200/30 rounded-lg p-3 flex-row"
                  onPress={() => router.push(`/movie/${item.movieId}/episode/${item.episodeServer?.episode?.id}`)}
                >
                  <View className="w-20 h-20 rounded-lg bg-secondary-300/50 mr-3 overflow-hidden">
                    {item.movie?.thumb_url ? (
                      <Image
                        source={{ uri: item.movie.thumb_url }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-full items-center justify-center">
                        <Ionicons name="film-outline" size={24} color="#9ca3af" />
                      </View>
                    )}
                  </View>

                  <VStack className="flex-1 justify-center">
                    <Text className="text-typography-800 font-medium" numberOfLines={1}>
                      {item.movie?.name || "Không xác định"}
                    </Text>
                    <Text className="text-typography-600 text-sm" numberOfLines={1}>
                      {item.episodeServer?.episode?.name
                        ? `Tập ${item.episodeServer.episode.name}`
                        : ""}
                    </Text>

                    {/* Progress bar */}
                    <View className="h-1.5 bg-secondary-300/30 rounded-full mt-2 overflow-hidden">
                      <View
                        className="h-full bg-primary-400 rounded-full"
                        style={{ width: `${item.progress}%` }}
                      />
                    </View>
                    <Text className="text-typography-500 text-xs mt-1">
                      {item.progress}% hoàn thành
                    </Text>
                  </VStack>
                </TouchableOpacity>
              ))}
            </VStack>
          ) : (
            <View className="py-5 items-center">
              <Ionicons name="film-outline" size={36} color="#666" />
              <Text className="text-typography-600 mt-2 text-center">
                Bạn chưa xem phim nào gần đây
              </Text>
            </View>
          )}
        </VStack>

        <Divider />

        {/* Downloaded Films Section */}
        <VStack className="px-5 py-4">
          <HStack className="justify-between items-center mb-3">
            <Heading size="sm" className="text-typography-800">
              Phim đã tải xuống
            </Heading>
            <TouchableOpacity onPress={() => router.push("/(main)/(tabs)/downloaded")}>
              <HStack className="items-center">
                <Text className="text-primary-400 text-sm mr-1">Xem tất cả</Text>
                <Ionicons name="chevron-forward" size={16} color="#f43f5e" />
              </HStack>
            </TouchableOpacity>
          </HStack>

          {recentDownload ? (
            <TouchableOpacity
              className="bg-secondary-200/30 rounded-lg p-3 flex-row"
              onPress={() => router.push(`/downloaded-player/${recentDownload.id}`)}
            >
              <View className="w-20 h-20 rounded-lg bg-secondary-300/50 mr-3 overflow-hidden">
                {recentDownload.thumbUrl ? (
                  <Image
                    source={{ uri: recentDownload.thumbUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-full items-center justify-center">
                    <Ionicons name="film-outline" size={24} color="#9ca3af" />
                  </View>
                )}
                <View className="absolute top-1 right-1 bg-green-500/80 rounded-full p-1">
                  <Ionicons name="checkmark-circle" size={12} color="#fff" />
                </View>
              </View>

              <VStack className="flex-1 justify-center">
                <Text className="text-typography-800 font-medium" numberOfLines={1}>
                  {recentDownload.episodeData?.episodeName || recentDownload.title.split(" - ")[1] || recentDownload.title}
                </Text>
                <Text className="text-typography-600 text-sm" numberOfLines={1}>
                  {recentDownload.episodeData?.episodeServerName || "Offline"}
                </Text>
                <HStack className="items-center mt-2">
                  <Ionicons name="time-outline" size={14} color="#9ca3af" />
                  <Text className="text-typography-500 text-xs ml-1">
                    {new Date(recentDownload.createdAt).toLocaleDateString()}
                  </Text>
                </HStack>
              </VStack>
            </TouchableOpacity>
          ) : (
            <View className="py-5 items-center">
              <Ionicons name="download-outline" size={36} color="#666" />
              <Text className="text-typography-600 mt-2 text-center">
                Bạn chưa tải xuống phim nào
              </Text>
            </View>
          )}
        </VStack>

        <Divider />

        {/* Logout Button */}
        <View className="px-5 py-6">
          <TouchableOpacity
            className="flex-row items-center justify-center py-3 rounded-lg border border-error-400 active:bg-error-400/10"
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#f43f5e" />
            <Text className="text-error-400 ml-2 font-medium">Đăng xuất</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Text */}
        <View className="items-center pb-4">
          <Text className="text-typography-500 text-xs">
            © Koflix - Nền tảng xem phim trực tuyến
          </Text>
        </View>
      </ScrollView>

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

      {/* Modals */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        confirmationType="logout"
        isLoading={isModalLoading}
      />

      <ConfirmationModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        onConfirm={() => {
          // Future implementation for changing avatar
          setShowAvatarModal(false);
        }}
        confirmationType="info"
        title="Thay đổi ảnh đại diện"
        message="Tính năng đang được phát triển"
        confirmText="Đóng"
        customConfig={{
          icon: "image-outline",
          iconColor: "#3B82F6",
          confirmColor: "info"
        }}
      />

      <ConfirmationModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onConfirm={() => {
          // Future implementation for changing password
          setShowPasswordModal(false);
        }}
        confirmationType="info"
        title="Đổi mật khẩu"
        message="Tính năng đang được phát triển"
        confirmText="Đóng"
        customConfig={{
          icon: "key-outline",
          iconColor: "#3B82F6",
          confirmColor: "info"
        }}
      />
    </View>
  );
};

export default ProfilePage;