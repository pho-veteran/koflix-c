import React from 'react';
import { View } from 'react-native';
import { Text } from "@/components/ui/text";

const FooterText: React.FC = () => {
  return (
    <View className="items-center pb-4">
      <Text className="text-typography-500 text-xs">
        © Koflix - Nền tảng xem phim trực tuyến
      </Text>
    </View>
  );
};

export default FooterText;