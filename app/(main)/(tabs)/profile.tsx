import React, { useEffect, useState } from "react";
import { View, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui/text";
import { Divider } from "@/components/ui/divider";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NETFLIX_RED, LOADING, HEADER_HEIGHT } from "@/constants/ui-constants";
import { useAuth } from "@/providers/auth-context";
import { getUserDetail, updateUserProfile } from "@/api/users";
import { getWatchHistory } from "@/api/user-movie";
import { User } from "@/types/user-type";
import { EpisodeWatchHistory } from "@/types/user-movie-type";
import HomeHeader from "@/components/layout/home-header";
import { useDownload } from "@/providers/download-context";
import { DownloadStatus, DownloadTask } from "@/types/download-type";
import ConfirmationModal from "@/components/modals/confirmation-modal";
import { useIsFocused } from "@react-navigation/native";
import ProfileUpdateModal from "@/components/modals/profile-update-modal";
import * as ImagePicker from "expo-image-picker";
import {
  ProfileHeader,
  WatchHistorySection,
  DownloadedSection,
  LogoutButton,
  FooterText
} from "@/components/profile";

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

  const [isModalLoading, setIsModalLoading] = useState(false);
  const [showProfileUpdateModal, setShowProfileUpdateModal] = useState(false);
  const [profileImage, setProfileImage] = useState<{ uri: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [errorModalConfig, setErrorModalConfig] = useState({
    show: false,
    message: ""
  });

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

  useEffect(() => {
    if (user) {
      setProfileImage(null);
    }
  }, [user, showProfileUpdateModal]);

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
    setShowProfileUpdateModal(true);
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfileImage({ uri: result.assets[0].uri });
    }
  };

  const handleSaveProfile = async (name: string) => {
    setProfileLoading(true);
    try {
      let imageFile: any = undefined;
      if (profileImage) {
        imageFile = {
          uri: profileImage.uri,
          name: 'avatar.jpg',
          type: 'image/jpeg',
        };
      }

      const updated = await updateUserProfile({ name, image: imageFile });
      if (updated) {
        setUser(updated);
        setShowProfileUpdateModal(false);
      } else {
        setErrorModalConfig({
          show: true,
          message: "Cập nhật thông tin thất bại. Vui lòng thử lại."
        });
      }
    } catch (e) {
      console.error("Error updating profile:", e);
      setErrorModalConfig({
        show: true,
        message: "Cập nhật thông tin thất bại. Vui lòng thử lại."
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const navigateToWatchHistory = () => {
    router.push("/watch-history");
  };

  const handleWatchHistoryItemPress = (item: EpisodeWatchHistory) => {
    if (item.movie?.id && item.episodeServer?.episode?.id && item.episodeServer.id) {
      router.push(
        `/movie/${item.movie.id}/episode/${item.episodeServer.episode.id}?serverId=${item.episodeServer.id}`
      );
    } else {
      console.error("Missing required navigation data", item);
    }
  };

  const navigateToDownloads = () => {
    router.push("/(main)/(tabs)/downloaded");
  };

  const navigateToDownloadedPlayer = (downloadId: string) => {
    router.push(`/downloaded-player/${downloadId}`);
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
        {/* Profile Header Component */}
        <ProfileHeader 
          user={user} 
          onChangeAvatar={handleChangeAvatar} 
        />

        <Divider />

        {/* Watch History Section Component */}
        <WatchHistorySection 
          watchHistory={watchHistory}
          onViewAll={navigateToWatchHistory}
          onItemPress={handleWatchHistoryItemPress}
        />

        <Divider />

        {/* Downloaded Section Component */}
        <DownloadedSection 
          recentDownload={recentDownload}
          onViewAll={navigateToDownloads}
          onItemPress={navigateToDownloadedPlayer}
        />

        <Divider />

        {/* Logout Button Component */}
        <LogoutButton onLogout={handleLogout} />

        {/* Footer Text Component */}
        <FooterText />
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

      <ProfileUpdateModal
        isOpen={showProfileUpdateModal}
        onClose={() => setShowProfileUpdateModal(false)}
        initialName={user?.name || ""}
        avatarUrl={user?.avatarUrl || undefined}
        isLoading={profileLoading}
        onPickImage={handlePickImage}
        onSave={handleSaveProfile}
        image={profileImage}
      />

      {errorModalConfig.show && (
        <ConfirmationModal
          isOpen={errorModalConfig.show}
          onClose={() => setErrorModalConfig({...errorModalConfig, show: false})}
          onConfirm={() => setErrorModalConfig({...errorModalConfig, show: false})}
          confirmationType="info"
          title="Lỗi"
          message={errorModalConfig.message}
          confirmText="Đóng"
          customConfig={{
            icon: "alert-circle-outline",
            iconColor: "#F43F5E"
          }}
        />
      )}
    </View>
  );
};

export default ProfilePage;