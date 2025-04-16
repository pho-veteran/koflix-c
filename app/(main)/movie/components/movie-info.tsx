import React from 'react';
import { View } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';

interface MovieInfoProps {
  name: string;
  originName?: string;
  year?: number;
  quality?: string;
  time?: string;
  episodeCurrent?: string;
  episodeTotal?: string;
}

const MovieInfo: React.FC<MovieInfoProps> = ({
  name,
  originName,
  year,
  quality,
  time,
  episodeCurrent,
  episodeTotal
}) => {
  return (
    <VStack space="sm">
      {/* Movie Title */}
      <Heading className="text-typography-950 text-2xl font-bold">
        {name}
      </Heading>
      
      {/* Original Title (if different) */}
      {originName && originName !== name && (
        <Text className="text-typography-500 -mt-1">
          {originName}
        </Text>
      )}
      
      {/* Metadata badges */}
      <HStack className="flex-wrap mt-1" space="xs">
        {year ? (
          <View className="bg-secondary-300/40 px-2 py-1 rounded-sm">
            <Text className="text-typography-800 text-xs">{year}</Text>
          </View>
        ) : null}
        
        {quality ? (
          <View className="bg-secondary-300/40 px-2 py-1 rounded-sm">
            <Text className="text-typography-800 text-xs">{quality}</Text>
          </View>
        ) : null}
        
        {time ? (
          <View className="bg-secondary-300/40 px-2 py-1 rounded-sm">
            <Text className="text-typography-800 text-xs">{time}</Text>
          </View>
        ) : null}
        
        {/* Episode progress */}
        {episodeCurrent && (
          <View className="bg-primary-400/40 px-2 py-1 rounded-sm">
            <Text className="text-typography-800 text-xs">
              {episodeCurrent}
            </Text>
          </View>
        )}
      </HStack>
    </VStack>
  );
};

export default MovieInfo;