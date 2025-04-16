import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';

interface FilterItem {
  id: string;
  name: string;
  slug?: string;
}

interface FilterListProps {
  items: FilterItem[];
  selectedIds?: string[];
  selectedId?: string;
  onSelect: (id: string, name: string) => void;
  multiSelect?: boolean;
}

export default function FilterList({
  items,
  selectedIds = [],
  selectedId,
  onSelect,
  multiSelect = false
}: FilterListProps) {

  const isItemSelected = (id: string) => {
    if (multiSelect) {
      return selectedIds.includes(id);
    }
    return id === selectedId;
  };

  return (
    <View className="flex-row flex-wrap px-3">
      {items.map(item => (
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.7}
          onPress={() => onSelect(item.id, item.name)}
          className={`mb-3 mr-3 px-4 py-2 rounded-xl border ${isItemSelected(item.id)
            ? 'bg-primary-500 border-primary-600'
            : 'bg-zinc-800/60 border-zinc-700/30'
            }`}
        >
          <Text className={`${isItemSelected(item.id) ? 'text-white' : 'text-zinc-300'} font-medium`}>
            {item.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}