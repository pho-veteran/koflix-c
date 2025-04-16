import React from 'react';
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";

interface EpisodeTitleProps {
  filename?: string;
}

const EpisodeTitle = ({ filename }: EpisodeTitleProps) => {
  return (
    <HStack className="items-center space-x-2 mb-3">
      <Text className="text-typography-800 text-lg font-semibold flex-1" numberOfLines={3}>
        {filename}
      </Text>
    </HStack>
  );
};

export default EpisodeTitle;