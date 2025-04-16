import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { ANIMATION, NETFLIX_RED } from '@/constants/ui-constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tmdb } from '@/types/movie';

interface MovieHeroProps {
  thumbUrl: string;
  status?: string;
  chieurap?: boolean;
  tmdb?: Tmdb;
}

const MovieHero: React.FC<MovieHeroProps> = ({ 
  thumbUrl, 
  status, 
  chieurap,
  tmdb
}) => {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const insets = useSafeAreaInsets();

  const getStatusBadgeStyle = (statusText: string) => {
    const lowerStatus = statusText.toLowerCase();
    
    if (lowerStatus === "completed" || lowerStatus === "hoàn thành") {
      return "bg-green-600/70";
    } else if (lowerStatus === "ongoing" || lowerStatus === "đang chiếu") {
      return "bg-blue-600/70";
    } else if (lowerStatus.includes("coming") || lowerStatus.includes("sắp chiếu")) {
      return "bg-yellow-600/70";
    } else {
      return "bg-secondary-400/70";
    }
  };

  const getStatusText = (statusText: string) => {
    const lowerStatus = statusText.toLowerCase();
    
    if (lowerStatus === "completed") {
      return "Hoàn thành";
    } else if (lowerStatus === "ongoing") {
      return "Đang chiếu";
    } else if (lowerStatus === "coming soon") {
      return "Sắp chiếu";
    } else {
      return statusText.charAt(0).toUpperCase() + statusText.slice(1);
    }
  };

  return (
    <View className="relative" style={{ height: 320 }}>
      {isImageLoading && (
        <View className="absolute inset-0 z-10 justify-center items-center bg-black/80">
          <ActivityIndicator
            size="large"
            color={NETFLIX_RED}
          />
        </View>
      )}
      <Image
        source={{ uri: thumbUrl }}
        contentFit="cover"
        transition={ANIMATION.IMAGE_TRANSITION}
        style={{ width: '100%', height: '100%' }}
        cachePolicy="memory-disk"
        onLoadStart={() => setIsImageLoading(true)}
        onLoadEnd={() => setIsImageLoading(false)}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,1)']}
        locations={[0, 0.7, 1]}
        className="absolute bottom-0 left-0 right-0 h-40"
      />
      
      {/* Status Badges */}
      <View 
        className="absolute right-3 z-20"
        style={{ top: insets.top + 20 }}
      >
        <HStack space="xs">
          {/* TMDB Rating Badge */}
          {tmdb && tmdb.vote_average > 0 && (
            <View className="bg-amber-700/70 px-2 py-1 rounded-md">
              <HStack space="xs" className="items-center">
                <Text className="text-typography-800 text-xs font-medium">
                  TMDB
                </Text>
                <Ionicons name="star" size={12} color="#fff" />
                <Text className="text-typography-800 text-xs font-medium">
                  {tmdb.vote_average.toFixed(1)}
                </Text>
              </HStack>
            </View>
          )}
          
          {/* Theater Release Badge */}
          {chieurap && (
            <View className="bg-amber-600/70 px-2 py-1 rounded-md">
              <Text className="text-typography-800 text-xs font-medium">Chiếu Rạp</Text>
            </View>
          )}
          
          {/* Status Badge */}
          {status && (
            <View className={`px-2 py-1 rounded-md ${getStatusBadgeStyle(status)}`}>
              <Text className="text-typography-800 text-xs font-medium">
                {getStatusText(status)}
              </Text>
            </View>
          )}
        </HStack>
      </View>
    </View>
  );
};

export default MovieHero;