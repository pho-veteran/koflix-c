import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  onClose: () => void;
}

export default function Header({ onClose }: HeaderProps) {
  return (
    <View className="px-5 pt-5 pb-3">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-bold text-primary-500">
          Bộ lọc tìm kiếm
        </Text>
        <TouchableOpacity 
          onPress={onClose}
          className="w-9 h-9 rounded-full bg-zinc-800/80 items-center justify-center"
        >
          <Ionicons name="close" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}