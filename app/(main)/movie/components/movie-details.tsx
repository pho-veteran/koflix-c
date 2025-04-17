import React from 'react';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Country, Category } from '@/types/movie-type';

interface MovieDetailsProps {
  countries: Country[];
  categories: Category[];
  directors: string[];
  actors: string[];
}

const MovieDetails: React.FC<MovieDetailsProps> = ({
  countries,
  categories,
  directors,
  actors
}) => {
  return (
    <VStack space="sm" className="bg-secondary-200/5 p-3 rounded-lg">
      <Heading size="sm" className="text-typographqy-950 mb-1">Thông tin chi tiết</Heading>
      
      {/* Countries */}
      {countries.length > 0 && (
        <HStack space="sm">
          <Text className="text-typography-800 font-medium w-24">Quốc gia:</Text>
          <Text className="text-typography-600 flex-1">
            {countries.map(c => c.name).join(', ')}
          </Text>
        </HStack>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <HStack space="sm">
          <Text className="text-typography-800 font-medium w-24">Thể loại:</Text>
          <Text className="text-typography-600 flex-1">
            {categories.map(c => c.name).join(', ')}
          </Text>
        </HStack>
      )}

      {/* Directors */}
      {directors.length > 0 && (
        <HStack space="sm">
          <Text className="text-typography-800 font-medium w-24">Đạo diễn:</Text>
          <Text className="text-typography-600 flex-1">{directors.join(', ')}</Text>
        </HStack>
      )}

      {/* Actors */}
      {actors.length > 0 && (
        <HStack space="sm" className="items-start">
          <Text className="text-typography-800 font-medium w-24">Diễn viên:</Text>
          <Text className="text-typography-600 flex-1">{actors.join(', ')}</Text>
        </HStack>
      )}
    </VStack>
  );
};

export default MovieDetails;