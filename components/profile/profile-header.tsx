import React from 'react';
import { View, TouchableOpacity, Image, Animated } from 'react-native';
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Ionicons } from "@expo/vector-icons";
import { User } from "@/types/user-type";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

const getRoleBadgeConfig = (role?: string) => {
  switch (role) {
    case "ADMIN":
      return {
        bgColor: "bg-primary-400/20",
        textColor: "text-primary-400",
        displayText: "Quản trị viên",
        icon: "shield-checkmark",
      };
    case "UPLOADER":
      return {
        bgColor: "bg-blue-500/20",
        textColor: "text-blue-500",
        displayText: "Uploader",
        icon: "cloud-upload",
      };
    default:
      return {
        bgColor: "bg-green-500/20",
        textColor: "text-green-500",
        displayText: "Người dùng",
        icon: "person",
      };
  }
};

const defaultTheme = {
  gradient: ['#f43f5e', '#ec4899'] as const,
  nameColor: "text-white",
  iconColor: "#f43f5e"
};

// Helper function to extract color from Tailwind class
const extractColorFromClass = (colorClass: string) => {
  const colorName = colorClass.replace('text-', '');
  
  switch (colorName) {
    case 'primary-400': return '#f43f5e';
    case 'blue-500': return '#3b82f6';
    case 'green-500': return '#22c55e';
    default: return '#ffffff';
  }
};

interface ProfileHeaderProps {
  user: User | null;
  onChangeAvatar: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  onChangeAvatar
}) => {
  const roleConfig = getRoleBadgeConfig(user?.role);
  const iconColor = extractColorFromClass(roleConfig.textColor);

  // Format the join date from createdAt timestamp
  const formatJoinDate = () => {
    if (!user?.createdAt) return "Chưa có thông tin";

    try {
      const date = parseISO(user.createdAt);
      return format(date, "dd MMMM, yyyy", { locale: vi });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Chưa có thông tin";
    }
  };

  const joinDate = formatJoinDate();

  return (
    <VStack className="px-5 pt-6 pb-6">
      {/* Main profile card with glassmorphism effect */}
      <View className="overflow-hidden rounded-xl">
        <BlurView
          intensity={20}
          tint="dark"
          className="overflow-hidden rounded-xl"
        >
          <View className="bg-secondary-200/5 p-5 border border-outline-200/10">
            <HStack className="items-center">
              {/* Avatar container with border based on role */}
              <TouchableOpacity
                onPress={onChangeAvatar}
                className="relative"
                activeOpacity={0.8}
              >
                <View className={`relative w-24 h-24 rounded-full overflow-hidden`}>
                  {user?.avatarUrl ? (
                    <Image
                      source={{ uri: user.avatarUrl }}
                      className="w-full h-full rounded-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <LinearGradient
                      colors={defaultTheme.gradient}
                      className="w-full h-full items-center justify-center"
                    >
                      <Text className="text-white text-4xl font-bold">
                        {user?.name?.charAt(0)?.toUpperCase() || "?"}
                      </Text>
                    </LinearGradient>
                  )}
                </View>

                {/* Edit indicator using default red */}
                <View className="absolute bottom-0 right-0 rounded-full p-2 border-2 border-secondary-200 shadow-sm"
                  style={{ backgroundColor: defaultTheme.gradient[0] }}>
                  <Ionicons name="pencil-sharp" size={14} color="#fff" />
                </View>
              </TouchableOpacity>

              <VStack className="ml-4 flex-1">
                {/* User name */}
                <HStack className="items-center">
                  <Heading size="xl" className="text-white mr-2">
                    {user?.name || "Người dùng"}
                  </Heading>
                </HStack>

                {/* Email/Phone */}
                <HStack className="items-center mt-1">
                  <Ionicons name="mail-outline" size={14} color="#9ca3af" />
                  <Text className="text-typography-400 text-sm ml-1.5 flex-1" numberOfLines={1}>
                    {user?.emailOrPhone || "Chưa cập nhật email"}
                  </Text>
                </HStack>

                {/* Join date */}
                <HStack className="items-center mt-1">
                  <Ionicons name="calendar-outline" size={14} color="#9ca3af" />
                  <Text className="text-typography-400 text-xs ml-1.5">
                    Tham gia: {joinDate}
                  </Text>
                </HStack>

                {/* Role badge with icon */}
                <HStack className="mt-2.5">
                  <View className={`px-3 py-1 rounded-full self-start ${roleConfig.bgColor} flex-row items-center`}>
                    <Ionicons 
                      name={roleConfig.icon as any} 
                      size={12} 
                      color={iconColor} 
                    />
                    <Text className={`text-xs font-medium ${roleConfig.textColor} ml-1`}>
                      {roleConfig.displayText}
                    </Text>
                  </View>
                </HStack>
              </VStack>
            </HStack>
          </View>
        </BlurView>
      </View>
    </VStack>
  );
};

export default ProfileHeader;