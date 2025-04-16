import React from 'react';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';

interface MovieSynopsisProps {
  content: string;
}

const MovieSynopsis: React.FC<MovieSynopsisProps> = ({ content }) => {
  return (
    <VStack space="xs">
      <Heading size="md" className="text-typography-950">Nội dung</Heading>
      <Text className="text-typography-600 leading-5">{content}</Text>
    </VStack>
  );
};

export default MovieSynopsis;