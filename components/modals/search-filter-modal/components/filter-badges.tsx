import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Ionicons } from '@expo/vector-icons';

interface FilterBadgesProps {
  filters: {
    id: string;
    name: string;
    onRemove: () => void;
  }[];
}

export default function FilterBadges({ filters }: FilterBadgesProps) {
  if (filters.length === 0) return null;

  return (
    <View className="px-5 mb-3">
      <Text className="text-zinc-400 mb-2">Bộ lọc đã chọn:</Text>
      <View className="flex-row flex-wrap">
        {filters.map(filter => (
          <View key={filter.id} className="mr-2 mb-2 bg-zinc-800 rounded-full px-3 py-1 flex-row items-center">
            <Text className="text-white text-sm mr-1">{filter.name}</Text>
            <TouchableOpacity onPress={filter.onRemove}>
              <Ionicons name="close-circle" size={16} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
}