import React from 'react';
import { View, TouchableOpacity, TextInput } from 'react-native';
import { Text } from '@/components/ui/text';

interface YearSelectorProps {
  startYearInput: string;
  endYearInput: string;
  onStartYearChange: (value: string) => void;
  onEndYearChange: (value: string) => void;
  onSelectPreset: (startYear: string, endYear: string) => void;
}

export default function YearSelector({
  startYearInput,
  endYearInput,
  onStartYearChange,
  onEndYearChange,
  onSelectPreset
}: YearSelectorProps) {
  const currentYear = new Date().getFullYear();

  return (
    <View className="px-5">
      <Text className="text-zinc-300 text-base mb-4">
        Nhập năm phát hành để lọc phim:
      </Text>

      <View className="mb-6">
        <Text className="text-zinc-400 mb-2">Từ năm:</Text>
        <View className="bg-zinc-800/60 border border-zinc-700/30 rounded-xl px-4 py-3">
          <TextInput
            className="text-white text-base"
            placeholder="Nhập năm bắt đầu"
            placeholderTextColor="#9ca3af"
            keyboardType="number-pad"
            maxLength={4}
            value={startYearInput}
            onChangeText={onStartYearChange}
          />
        </View>
        {startYearInput && (parseInt(startYearInput) < 1900 || parseInt(startYearInput) > currentYear) && (
          <Text className="text-red-500 mt-1 text-sm">
            Vui lòng nhập năm từ 1900 đến {currentYear}
          </Text>
        )}
      </View>

      <View className="mb-4">
        <Text className="text-zinc-400 mb-2">Đến năm:</Text>
        <View className="bg-zinc-800/60 border border-zinc-700/30 rounded-xl px-4 py-3">
          <TextInput
            className="text-white text-base"
            placeholder="Nhập năm kết thúc"
            placeholderTextColor="#9ca3af"
            keyboardType="number-pad"
            maxLength={4}
            value={endYearInput}
            onChangeText={onEndYearChange}
          />
        </View>
        {endYearInput && (parseInt(endYearInput) < 1900 || parseInt(endYearInput) > currentYear) && (
          <Text className="text-red-500 mt-1 text-sm">
            Vui lòng nhập năm từ 1900 đến {currentYear}
          </Text>
        )}
      </View>

      {/* Quick year selection buttons */}
      <View className="mt-4">
        <Text className="text-zinc-400 mb-2">Chọn nhanh:</Text>
        <View className="flex-row flex-wrap">
          <TouchableOpacity
            onPress={() => onSelectPreset('', '')}
            className="mb-3 mr-3 px-4 py-2 rounded-xl border bg-zinc-800/60 border-zinc-700/30"
          >
            <Text className="text-zinc-300 font-medium">Tất cả năm</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              const year = currentYear.toString();
              onSelectPreset(year, year);
            }}
            className="mb-3 mr-3 px-4 py-2 rounded-xl border bg-zinc-800/60 border-zinc-700/30"
          >
            <Text className="text-zinc-300 font-medium">Năm {currentYear}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              const year = (currentYear - 1).toString();
              onSelectPreset(year, year);
            }}
            className="mb-3 mr-3 px-4 py-2 rounded-xl border bg-zinc-800/60 border-zinc-700/30"
          >
            <Text className="text-zinc-300 font-medium">Năm {currentYear - 1}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              onSelectPreset((currentYear - 9).toString(), currentYear.toString());
            }}
            className="mb-3 mr-3 px-4 py-2 rounded-xl border bg-zinc-800/60 border-zinc-700/30"
          >
            <Text className="text-zinc-300 font-medium">10 năm gần đây</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}