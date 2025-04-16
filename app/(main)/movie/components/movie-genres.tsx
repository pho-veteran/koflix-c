import React from 'react';
import { View } from 'react-native';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';

interface MovieGenresProps {
  genres: string[];
}

const MovieGenres: React.FC<MovieGenresProps> = ({ genres }) => {
  if (genres.length === 0) return null;
  
  return (
    <HStack className="flex-wrap" space="xs">
      {genres.map((genre, index) => (
        <View key={index} className="bg-secondary-300/20 px-3 py-1 rounded-full">
          <Text className="text-typography-700 text-xs">{genre}</Text>
        </View>
      ))}
    </HStack>
  );
};

export default MovieGenres;