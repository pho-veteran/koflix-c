import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import {
  HEADER_HEIGHT,
  APP_NAME,
  TEXT_STYLING,
} from '@/constants/ui-constants';

interface HomeHeaderProps {
  rightElement?: React.ReactNode;
}

export default function HomeHeader({
  rightElement
}: HomeHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const opacity = 0.9;

  return (
    <View
      className="absolute top-0 left-0 right-0 z-50"
      style={{ height: HEADER_HEIGHT + insets.top }}
    >
      <View
        className="absolute inset-0"
        style={{ opacity }}
      >
        <BlurView intensity={20} tint="dark" className="absolute inset-0" />
        <View className="absolute inset-0 bg-[#0a0a0a]/80" />
      </View>

      <View
        className="flex-row items-center justify-between px-4 h-full"
        style={{ paddingTop: insets.top }}
      >
        <Text
          className="text-primary-400 font-bold text-2xl tracking-tighter"
          style={{
            textShadowColor: TEXT_STYLING.SHADOW_COLOR,
            textShadowOffset: TEXT_STYLING.SHADOW_OFFSET,
            textShadowRadius: TEXT_STYLING.SHADOW_RADIUS
          }}
        >
          {APP_NAME}
        </Text>

        <View className="flex-row items-center">
          {rightElement}
          <TouchableOpacity
            className="w-10 h-10 justify-center items-center rounded-full"
            activeOpacity={0.7}
            onPress={() => router.push('/search')}
          >
            <Ionicons name="search" size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}