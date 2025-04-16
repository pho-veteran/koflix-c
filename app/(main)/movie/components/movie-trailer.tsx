import React, { useState, useCallback, useRef } from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { NETFLIX_RED } from '@/constants/ui-constants';
import YoutubeIframe from 'react-native-youtube-iframe';
import { LinearGradient } from 'expo-linear-gradient';

interface MovieTrailerProps {
  trailerUrl?: string;
  title: string;
}

const extractYoutubeId = (url?: string): string | null => {
  if (!url) return null;

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  return (match && match[2].length === 11) ? match[2] : null;
};

const MovieTrailer: React.FC<MovieTrailerProps> = ({ trailerUrl, title }) => {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoId = extractYoutubeId(trailerUrl);

  const onStateChange = useCallback((state: string) => {
    if (state === 'ended') {
      setPlaying(false);
    }
  }, []);

  const togglePlaying = () => {
    setLoading(true);
    setPlaying(prev => !prev);
  };

  if (!videoId) {
    return null;
  }

  return (
    <View className="mt-4 mb-6">
      <Heading size="md" className="text-typography-950 mb-3 px-4">
        Trailer
      </Heading>

      <View className="relative bg-secondary-200 rounded-lg overflow-hidden">
        {!playing ? (
          // Thumbnail with play button
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={togglePlaying}
            className="w-full aspect-video relative"
          >
            <Image
              source={{ uri: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` }}
              style={{ width: '100%', height: '100%' }}
              cachePolicy="memory-disk"
              contentFit="cover"
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
              className="absolute inset-0 flex items-center justify-center"
            >
              <View className="bg-primary-400/90 h-14 w-14 rounded-full items-center justify-center">
                <Ionicons name="play" size={28} color="#fff" />
              </View>
              <Text className="text-typography-800 text-center absolute bottom-4 font-medium">
                {title}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View className="w-full aspect-video">
            {loading && (
              <View className="absolute inset-0 z-10 flex items-center justify-center bg-secondary-100/80">
                <ActivityIndicator size="large" color={NETFLIX_RED} />
              </View>
            )}
            <YoutubeIframe
              height={300}
              play={playing}
              videoId={videoId}
              onChangeState={onStateChange}
              onReady={() => setLoading(false)}
              onError={(e) => {
                setError('Không thể phát trailer. Vui lòng thử lại sau.');
                setPlaying(false);
                setLoading(false);
                console.error('YouTube player error:', e);
              }}
            />
          </View>
        )}

        {error && (
          <View className="p-3 bg-background-error rounded-b-lg">
            <Text className="text-error-400 text-center">{error}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default MovieTrailer;