import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';

interface ActionButtonsProps {
  onClear: () => void;
  onApply: () => void;
  hasFilters: boolean;
}

export default function ActionButtons({
  onClear,
  onApply,
  hasFilters
}: ActionButtonsProps) {
  return (
    <View className="p-5 border-t border-zinc-800 flex-row justify-between">
      <TouchableOpacity
        onPress={onClear}
        className="px-5 py-3 rounded-xl bg-zinc-800 mr-3"
        disabled={!hasFilters}
        activeOpacity={hasFilters ? 0.7 : 1}
      >
        <Text className={`font-medium text-center ${hasFilters ? 'text-white' : 'text-zinc-600'}`}>
          Xóa tất cả
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onApply}
        className="flex-1 px-5 py-3 rounded-xl bg-primary-500"
        activeOpacity={0.7}
      >
        <Text className="font-medium text-white text-center">
          Áp dụng
        </Text>
      </TouchableOpacity>
    </View>
  );
}