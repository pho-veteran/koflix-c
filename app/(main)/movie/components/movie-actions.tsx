import React from 'react';
import { TouchableOpacity } from 'react-native';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Ionicons } from '@expo/vector-icons';

interface MovieActionsProps {
  onOpenEpisodeModal?: () => void;
}

const MovieActions: React.FC<MovieActionsProps> = ({ 
  onOpenEpisodeModal,
}) => {
  return (
    <HStack className="px-4 py-3 bg-secondary-100/10 justify-between">
      {/* Play Button */}
      <TouchableOpacity
        className="bg-primary-400 py-2.5 px-6 rounded-md w-full"
        activeOpacity={0.8}
        onPress={onOpenEpisodeModal}
      >
        <HStack space="sm" className="items-center justify-center">
          <Ionicons name="play" size={18} color="#fff" />
          <Text className="text-typography-950 font-bold">
            Xem Phim
          </Text>
        </HStack>
      </TouchableOpacity>
    </HStack>
  );
};

export default MovieActions;