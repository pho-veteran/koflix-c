import React, { useState } from 'react';
import { 
  View, 
  Image, 
  ActivityIndicator,
  Pressable
} from 'react-native';
import { Text } from "@/components/ui/text";
import { useRouter } from 'expo-router';
import { MovieBase } from '@/types/movie-type';
import { LinearGradient } from 'expo-linear-gradient';

interface ThumbnailCardProps {
  movie: MovieBase;
  index: number;
}

const ThumbnailCard: React.FC<ThumbnailCardProps> = ({ movie, index }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handlePress = () => {
    router.push(`/movie/${movie.id}`);
  };

  const getImageUrl = () => {
    return movie.thumb_url || movie.poster_url || null;
  };

  return (
    <Pressable onPress={handlePress}>
      <View 
        className="rounded-lg overflow-hidden bg-secondary-200/20 mb-1"
        style={{ aspectRatio: 16/9 }}
      >
        {getImageUrl() ? (
          <>
            <Image
              source={{ uri: getImageUrl() as string }}
              className="w-full h-full"
              resizeMode="cover"
              onLoadStart={() => setIsLoading(true)}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            />
            
            {/* Shadow gradient overlay at bottom */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              className="absolute bottom-0 left-0 right-0 h-1/2 justify-end p-2"
            >
              <Text 
                className="text-white font-medium text-sm" 
                numberOfLines={1}
              >
                {movie.name}
              </Text>
              
              {movie.year && (
                <Text className="text-typography-600 text-xs">
                  {movie.year}
                </Text>
              )}
            </LinearGradient>
            
            {/* Score badge - show only if score exists */}
            {movie.score && movie.score > 0 && (
              <View className="absolute top-1 right-1 bg-primary-400/90 px-1 rounded">
                <Text className="text-white text-xs font-bold">
                  {movie.score.toFixed(1)}
                </Text>
              </View>
            )}
            
            {/* Loading indicator */}
            {isLoading && (
              <View className="absolute inset-0 items-center justify-center bg-secondary-200/30">
                <ActivityIndicator size="small" color="#E50914" />
              </View>
            )}
          </>
        ) : (
          <View className="w-full h-full items-center justify-center bg-secondary-200/30">
            {hasError ? (
              <Text className="text-typography-600 text-xs text-center px-2">
                Image unavailable
              </Text>
            ) : (
              <Text className="text-typography-600 text-xs text-center px-2">
                {movie.name}
              </Text>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
};

export default ThumbnailCard;