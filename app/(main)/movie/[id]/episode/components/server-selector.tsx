import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import Animated, { FadeInDown } from 'react-native-reanimated';
import { EpisodeServer } from "@/types/movie";

interface ServerSelectorProps {
  servers: EpisodeServer[];
  selectedServer: EpisodeServer | null;
  onSelectServer: (server: EpisodeServer) => void;
}

const ServerSelector = ({
  servers,
  selectedServer,
  onSelectServer
}: ServerSelectorProps) => {
  return (
    <Animated.View entering={FadeInDown.delay(300).duration(400)}>
      <VStack className="mb-5 bg-secondary-200/50 p-4 rounded-xl">
        <HStack className="justify-between items-center mb-3">
          <HStack space="xs" className="items-center">
            <Ionicons name="server-outline" size={18} color="#fff" />
            <Text className="text-typography-700 font-medium">Nguồn phát</Text>
          </HStack>
          <Text className="text-typography-500 text-xs">
            {servers?.length || 0} nguồn
          </Text>
        </HStack>

        {/* Elegant server options */}
        <View className="flex-row flex-wrap gap-2">
          {servers && servers.map((server, idx) => (
            <TouchableOpacity
              key={server.server_name + idx}
              onPress={() => onSelectServer(server)}
              className={`rounded-lg overflow-hidden mb-2 active:opacity-80 ${selectedServer?.server_name === server.server_name
                  ? 'bg-primary-400'
                  : 'bg-secondary-300/60'
                }`}
            >
              <HStack className="py-2.5 px-4 items-center">
                <Ionicons
                  name={selectedServer?.server_name === server.server_name ? "checkmark-circle" : "play-circle-outline"}
                  size={18}
                  color={selectedServer?.server_name === server.server_name ? "#1a1a1a" : "#fff"}
                />
                <Text
                  className={`ml-2 ${selectedServer?.server_name === server.server_name
                      ? 'text-typography-950 font-medium'
                      : 'text-typography-700'
                    }`}
                >
                  {server.server_name}
                </Text>
              </HStack>
            </TouchableOpacity>
          ))}
          {(!servers || servers.length === 0) && (
            <Text className="text-typography-500">Không có nguồn phát nào</Text>
          )}
        </View>
      </VStack>
    </Animated.View>
  );
};

export default ServerSelector;