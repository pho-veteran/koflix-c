import React, { useMemo } from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StyleSheet,
  useWindowDimensions
} from "react-native";
import { AlertDialog, AlertDialogBackdrop, AlertDialogContent } from "../ui/alert-dialog";
import { Text } from "../ui/text";
import { HStack } from "../ui/hstack";
import { VStack } from "../ui/vstack";
import { Heading } from "../ui/heading";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Episode } from "@/types/movie-type";

interface EpisodeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  episodes: Episode[];
  movieName: string;
  episodeCurrent?: string;
  episodeTotal?: string;
  status?: string;
  onSelectEpisode: (episode: Episode) => void;
  isFullscreen?: boolean;
}

const EpisodeSelectorModal: React.FC<EpisodeSelectorModalProps> = ({
  isOpen,
  onClose,
  episodes,
  movieName,
  episodeCurrent,
  episodeTotal,
  status,
  onSelectEpisode,
  isFullscreen = false
}) => {
  const { width, height } = useWindowDimensions();

  // Determine if we're in landscape mode based on dimensions or isFullscreen prop
  const isLandscape = isFullscreen || width > height;

  // Use 2 columns in landscape mode, otherwise 1 column
  const numColumns = isLandscape ? 2 : 1;

  // Sort episodes by name in ascending order
  const sortedEpisodes = useMemo(() => {
    return [...episodes].sort((a, b) => {
      const numA = parseInt(a.name);
      const numB = parseInt(b.name);
      
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB; // Ascending order
      }
      
      return a.name.localeCompare(b.name); // Ascending order
    });
  }, [episodes]);

  const handleEpisodeSelect = (episode: Episode) => {
    onSelectEpisode(episode);
    onClose();
  };

  const renderEpisode = ({ item: episode }: { item: Episode }) => {
    return (
      <TouchableOpacity
        onPress={() => handleEpisodeSelect(episode)}
        className="mb-3 active:opacity-80"
        activeOpacity={0.7}
        style={[
          styles.episodeButton,
          isLandscape && { width: '48%', marginHorizontal: '1%' }
        ]}
      >
        <LinearGradient
          colors={['rgba(38,38,38,0.8)', 'rgba(26,26,26,0.9)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-xl overflow-hidden"
          style={styles.episodeCard}
        >
          <HStack className="items-center">
            {/* Episode Number Circle */}
            <View className="w-12 h-12 rounded-full bg-background-300/30 justify-center items-center">
              <Text className="text-typography-800 font-bold text-base">
                {episode.name}
              </Text>
            </View>

            {/* Episode Info */}
            <View className="flex-1 ml-3 mr-1">
              {episode.servers && episode.servers.length > 0 && (
                <HStack className="items-center" space="sm">
                  <View className="w-2 h-2 rounded-full bg-primary-400/80" />
                  <Text className="text-typography-500 text-xs">
                    {episode.servers.length} nguồn phát
                  </Text>
                </HStack>
              )}
            </View>

            {/* Play Button */}
            <View className="bg-primary-400/10 rounded-lg p-2">
              <View className="w-8 h-8 rounded-full bg-primary-400 items-center justify-center">
                <Ionicons name="play" size={16} color="#fff" />
              </View>
            </View>
          </HStack>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <AlertDialog isOpen={isOpen}>
      <AlertDialogBackdrop onPress={onClose} />
      <AlertDialogContent
        className="m-0 p-0 border-0 rounded-xl bg-transparent overflow-hidden"
        style={[
          styles.modalContainer,
          isLandscape && styles.landscapeModal
        ]}
      >
        <LinearGradient
          colors={['rgba(18,18,18,0.98)', 'rgba(13,13,13,0.99)']}
          className="w-full rounded-xl"
        >
          {/* Header */}
          <VStack className="border-b border-outline-200/20 px-5 py-4">
            <HStack className="justify-between items-center w-full">
              <VStack>
                <Heading className="text-typography-950 text-xl font-bold">
                  Tập phim
                </Heading>
                <Text className="text-typography-500 text-sm mt-1 truncate w-64" numberOfLines={1}>
                  {movieName}
                </Text>
              </VStack>

              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }}
                className="w-8 h-8 rounded-full bg-background-300/80 items-center justify-center"
              >
                <Ionicons name="close" size={18} color="#fff" />
              </TouchableOpacity>
            </HStack>

            {/* Status Badges */}
            <HStack className="flex-wrap mt-3" space="xs">
              {episodeCurrent && (
                <View className="bg-primary-400/40 px-2 py-1 rounded-md">
                  <Text className="text-typography-800 text-xs font-medium">{episodeCurrent}
                  </Text>
                </View>
              )}

              {status && (
                <View className={`px-2 py-1 rounded-md ${status.toLowerCase() === "completed" ?
                  "bg-green-600/40" :
                  status.toLowerCase() === "ongoing" ?
                    "bg-blue-500/40" :
                    "bg-yellow-500/40"
                  }`}>
                  <Text className="text-typography-800 text-xs font-medium">
                    {status === "completed" ? "Hoàn thành" :
                      status === "ongoing" ? "Đang chiếu" : status}
                  </Text>
                </View>
              )}

              {episodeTotal && (
                <View className="bg-secondary-300/60 px-2 py-1 rounded-md">
                  <Text className="text-typography-800 text-xs font-medium">
                    Tổng {episodeTotal} tập
                  </Text>
                </View>
              )}
            </HStack>
          </VStack>

          {/* Episodes List */}
          <View style={{ maxHeight: isLandscape ? height * 0.5 : 400 }}>
            <FlatList
              data={sortedEpisodes}
              renderItem={renderEpisode}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              className="px-5 py-3"
              initialNumToRender={8}
              maxToRenderPerBatch={5}
              numColumns={numColumns}
              key={numColumns}
              columnWrapperStyle={isLandscape ? { justifyContent: 'space-between' } : undefined}
              ListEmptyComponent={
                <View className="py-10 px-5 items-center justify-center">
                  <Ionicons name="film-outline" size={36} color="#666" />
                  <Text className="text-typography-500 mt-3 text-center">
                    Không có tập phim nào
                  </Text>
                </View>
              }
              contentContainerStyle={{
                paddingBottom: 10
              }}
            />
          </View>
        </LinearGradient>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    width: Dimensions.get('window').width - 32,
    maxWidth: 500,
    alignSelf: 'center',
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  landscapeModal: {
    width: '80%',
    maxWidth: 800,
    maxHeight: '80%',
  },
  episodeButton: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  episodeCard: {
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  }
});

export default EpisodeSelectorModal;