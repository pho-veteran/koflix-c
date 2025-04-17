import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import Animated, { FadeInDown } from 'react-native-reanimated';
import { EpisodeServer } from "@/types/movie-type";
import { LinearGradient } from 'expo-linear-gradient';

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
      <VStack className="mb-5 bg-secondary-200/40 p-5 rounded-xl">
        <HStack className="justify-between items-center mb-4">
          <HStack space="xs" className="items-center">
            <View className="bg-secondary-300/60 p-1.5 rounded-md">
              <Ionicons name="server-outline" size={18} color="#fff" />
            </View>
            <Text className="text-typography-700 font-medium text-base">Nguồn phát</Text>
          </HStack>
          <View className="bg-secondary-300/30 px-2.5 py-1 rounded-full">
            <Text className="text-typography-500 text-xs font-medium">
              {servers?.length || 0} nguồn
            </Text>
          </View>
        </HStack>

        {/* Elegant server options with improved layout */}
        <View className="flex-row flex-wrap gap-2.5">
          {servers && servers.length > 0 ? (
            servers.map((server, idx) => {
              const isSelected = selectedServer?.server_name === server.server_name;
              
              return (
                <TouchableOpacity
                  key={server.server_name + idx}
                  onPress={() => onSelectServer(server)}
                  activeOpacity={0.7}
                  className={`rounded-lg overflow-hidden mb-2`}
                  style={{
                    borderWidth: 1.5,
                    borderColor: isSelected ? 'rgb(229, 9, 20)' : 'transparent',
                  }}
                >
                  <LinearGradient
                    colors={
                      isSelected 
                        ? ['rgb(229, 9, 20)', 'rgb(166, 18, 20)']
                        : ['rgba(38, 38, 38, 0.8)', 'rgba(26, 26, 26, 0.6)']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="py-3 px-4"
                  >
                    <HStack className="items-center">
                      <View className={`mr-2.5 ${isSelected ? 'opacity-100' : 'opacity-70'}`}>
                        <Ionicons
                          name={isSelected ? "checkmark-circle" : "play-circle-outline"}
                          size={18}
                          color={isSelected ? "#fff" : "rgb(212, 212, 212)"}
                        />
                      </View>
                      <Text
                        className={`${isSelected
                          ? 'text-white font-medium'
                          : 'text-typography-600'
                        }`}
                        numberOfLines={1}
                      >
                        {server.server_name}
                      </Text>
                    </HStack>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })
          ) : (
            <View className="bg-secondary-300/20 py-4 px-3 rounded-lg w-full items-center">
              <Ionicons name="alert-circle-outline" size={24} color="#999" className="mb-2" />
              <Text className="text-typography-500 text-center">
                Không có nguồn phát nào cho nội dung này
              </Text>
            </View>
          )}
        </View>
      </VStack>
    </Animated.View>
  );
};

export default ServerSelector;