import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';

type TabType = 'genres' | 'types' | 'countries' | 'years';

interface TabSelectorProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function TabSelector({ activeTab, onTabChange }: TabSelectorProps) {
  const tabs = [
    { id: 'genres', label: 'Thể loại' },
    { id: 'types', label: 'Loại phim' },
    { id: 'countries', label: 'Quốc gia' },
    { id: 'years', label: 'Năm' },
  ] as const;

  return (
    <View className="mx-5 mb-3">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
      >
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={tab.id}
            className={`py-2 px-5 rounded-full ${index < tabs.length - 1 ? 'mr-3' : ''
              } ${activeTab === tab.id ? 'bg-primary-500' : 'bg-zinc-800/60'}`}
            onPress={() => onTabChange(tab.id)}
          >
            <Text className={`font-medium ${activeTab === tab.id ? 'text-white' : 'text-zinc-400'}`}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}