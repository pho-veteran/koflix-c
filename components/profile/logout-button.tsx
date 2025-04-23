import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from "@/components/ui/text";
import { Ionicons } from "@expo/vector-icons";

interface LogoutButtonProps {
  onLogout: () => void;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ onLogout }) => {
  return (
    <View className="px-5 py-6">
      <TouchableOpacity
        className="flex-row items-center justify-center py-3 rounded-lg border border-error-400 active:bg-error-400/10"
        onPress={onLogout}
      >
        <Ionicons name="log-out-outline" size={20} color="#f43f5e" />
        <Text className="text-error-400 ml-2 font-medium">Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LogoutButton;