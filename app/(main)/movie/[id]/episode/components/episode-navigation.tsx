import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import Animated, { FadeInDown } from 'react-native-reanimated';

interface EpisodeNavigationProps {
  hasPrevious: boolean;
  hasNext: boolean;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
  onOpenEpisodeModal: () => void;
}

const EpisodeNavigation = ({
  hasPrevious,
  hasNext,
  onNavigatePrev,
  onNavigateNext,
  onOpenEpisodeModal
}: EpisodeNavigationProps) => {
  return (
    <Animated.View entering={FadeInDown.delay(100).duration(400)} className="mb-5">
      <HStack className="justify-between items-center mb-4">
        <TouchableOpacity
          onPress={onNavigatePrev}
          disabled={!hasPrevious}
          className={`bg-secondary-200 px-4 py-2 rounded-lg flex-row items-center ${!hasPrevious ? 'opacity-50' : 'active:opacity-80'}`}
        >
          <Ionicons name="chevron-back" size={18} color="#fff" />
          <Text className="text-typography-800 text-sm ml-1">Tập trước</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onOpenEpisodeModal}
          className="bg-secondary-300 px-4 py-2 rounded-lg active:opacity-80"
        >
          <HStack space="xs" className="items-center">
            <Ionicons name="list" size={16} color="#fff" />
            <Text className="text-typography-800 text-sm">Tất cả tập</Text>
          </HStack>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onNavigateNext}
          disabled={!hasNext}
          className={`bg-secondary-200 px-4 py-2 rounded-lg flex-row items-center ${!hasNext ? 'opacity-50' : 'active:opacity-80'}`}
        >
          <Text className="text-typography-800 text-sm mr-1">Tập sau</Text>
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </HStack>
    </Animated.View>
  );
};

export default EpisodeNavigation;