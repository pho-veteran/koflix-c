import React, { useState } from "react";
import { View, Pressable, StyleProp, ViewStyle } from "react-native";
import { Image } from "expo-image";
import { MovieBase } from "@/types/movie-type";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { ActivityIndicator } from "react-native";
import {
  CARD_WIDTH,
  CARD_HEIGHT,
  NETFLIX_RED,
  ANIMATION,
  GRADIENTS
} from "@/constants/ui-constants";

interface PosterCardProps {
  movie: MovieBase;
  index?: number;
  style?: StyleProp<ViewStyle>;
}

const PosterCard: React.FC<PosterCardProps> = ({
  movie,
  index = 0,
  style
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePress = () => {
    router.push(`/movie/${movie.id}`);
  };

  const imageSource = { uri: movie.poster_url || movie.thumb_url };

  return (
    <Animated.View
      entering={FadeIn.duration(ANIMATION.FADE_IN_DURATION).delay(100 + (index % 10) * 50)}
      style={[animatedStyle]}
      className="mr-3"
    >
      <Pressable
        onPress={handlePress}
        className="rounded-lg overflow-hidden shadow-md"
        style={[
          {
            width: CARD_WIDTH,
            height: CARD_HEIGHT
          },
          style
        ]}
      >
        <View className="w-full h-full bg-black rounded-lg">
          <Image
            source={imageSource}
            style={{ width: '100%', height: '100%' }}
            className="absolute inset-0 rounded-lg"
            contentFit="cover"
            transition={ANIMATION.IMAGE_TRANSITION}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
          />

          {isLoading && (
            <View className="absolute inset-0 flex items-center justify-center bg-secondary-100/30 rounded-lg">
              <ActivityIndicator size="small" color={NETFLIX_RED} />
            </View>
          )}

          {/* Year badge */}
          {movie.year && (
            <View className="absolute top-2 left-2 z-10 bg-black/70 px-2 py-0.5 rounded-sm">
              <Text className="text-typography-800 text-[10px] font-medium">
                {movie.year}
              </Text>
            </View>
          )}

          {/* Enhanced gradient overlay with fixed border radius alignment */}
          <LinearGradient
            colors={GRADIENTS.THUMBNAIL_FADE}
            locations={GRADIENTS.THUMBNAIL_FADE_LOCATIONS}
            className="absolute bottom-[-1px] left-0 right-0 h-1/2 z-10"
            style={{
              borderBottomLeftRadius: 8,
              borderBottomRightRadius: 8
            }}
          />

          {/* Movie title at bottom with enhanced styling */}
          <View className="absolute bottom-0 left-0 right-0 p-2.5 z-20">
            <Text
              numberOfLines={2}
              className="text-typography-950 font-medium text-xs"
            >
              {movie.name}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default PosterCard;