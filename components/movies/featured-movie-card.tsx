import React, { useState } from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { MovieBase } from "@/types/movie";
import { useRouter } from "expo-router";
import Animated from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import {
  FEATURED_HEIGHT,
  NETFLIX_RED,
  ANIMATION,
  GRADIENTS
} from "@/constants/ui-constants";

const FEATURED_BADGE_COLORS = {
  TOP_1: "bg-primary-400",
  TOP_2: "bg-amber-500",
  TOP_3: "bg-green-600"
};

interface FeaturedMovieCardProps {
  movie: MovieBase;
  index: number;
  style?: any;
}

const FeaturedMovieCard: React.FC<FeaturedMovieCardProps> = ({
  movie,
  index,
  style
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const handleDetailsPress = () => {
    router.push(`/movie/${movie.id}`);
  };

  const imageUrl = movie.thumb_url || movie.poster_url;

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={handleDetailsPress}
      style={[style, { height: FEATURED_HEIGHT }]}
      className="relative"
    >
      <View className="flex-1 justify-end relative bg-black overflow-hidden">
        {/* Main image */}
        <View className="absolute inset-0">
          <Image
            source={{ uri: imageUrl }}
            contentFit="cover"
            transition={ANIMATION.IMAGE_TRANSITION}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            style={{ width: '100%', height: '100%' }}
            cachePolicy="memory-disk"
          />
        </View>

        {/* Loading indicator */}
        {isLoading && (
          <View className="absolute inset-0 flex items-center justify-center bg-black">
            <ActivityIndicator size="large" color={NETFLIX_RED} />
          </View>
        )}

        {/* Year badge */}
        {movie.year && (
          <View className="absolute top-3 right-3 z-20 bg-black/70 px-2 py-1">
            <Text className="text-typography-800 font-medium text-xs">
              {movie.year}
            </Text>
          </View>
        )}

        {/* Top fade gradient */}
        <LinearGradient
          colors={GRADIENTS.TOP_FADE}
          locations={GRADIENTS.TOP_FADE_LOCATIONS}
          className="absolute h-20 left-0 right-0 top-0"
        />

        {/* Bottom gradient for content */}
        <LinearGradient
          colors={GRADIENTS.BOTTOM_FADE}
          locations={GRADIENTS.BOTTOM_FADE_LOCATIONS}
          className="absolute h-full w-full"
        />

        {/* Content container */}
        <View className="px-5 pb-6 pt-10 items-center relative z-10">
          {/* Badge for top 3 movies */}
          {index < 3 && (
            <View
              className={`px-4 py-1.5 mb-4 shadow-lg ${index === 0
                ? FEATURED_BADGE_COLORS.TOP_1
                : index === 1
                  ? FEATURED_BADGE_COLORS.TOP_2
                  : FEATURED_BADGE_COLORS.TOP_3
                }`}
            >
              <Text className="text-typography-950 text-xs font-bold">
                {index === 0 ? "Phim Hàng Đầu" : `Top ${index + 1}`}
              </Text>
            </View>
          )}

          <Heading size="xl" className="text-center mb-2 text-typography-950">
            {movie.name}
          </Heading>

          {/* Genre badges */}
          {movie.genres && movie.genres.length > 0 && (
            <View className="flex-row flex-wrap justify-center mb-2 gap-2">
              {movie.genres.slice(0, 3).map((genre, idx) => (
                <View key={idx} className="bg-secondary-300/60 px-3 py-1 rounded-full">
                  <Text className="text-typography-800 text-xs font-medium">
                    {genre}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default FeaturedMovieCard;