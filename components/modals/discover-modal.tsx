import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { Text } from '@/components/ui/text';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getGenres, getTypes } from '@/api/movies';
import { LOADING } from '@/constants/ui-constants';
import { AlertDialog, AlertDialogBackdrop, AlertDialogContent, AlertDialogBody } from '@/components/ui/alert-dialog';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MovieGenre, MovieType } from '@/types/movie-type';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_SIZE = (SCREEN_WIDTH * 0.85 - 48) / 3;

interface DiscoverModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (id: string, name: string, type: 'genre' | 'type') => void;
  onUnselect?: () => void;
  hasActiveFilter?: boolean;
}

const GENRE_ICONS: Record<string, string> = {
  'hanh-dong': 'local-fire-department',
  'mien-tay': 'landscape',
  'tre-em': 'child-care',
  'lich-su': 'history-edu',
  'co-trang': 'account-balance',
  'chien-tranh': 'military-tech',
  'vien-tuong': 'rocket',
  'kinh-di': 'nights-stay',
  'tai-lieu': 'assignment',
  'bi-an': 'search',
  'phim-18': '18-up-rating',
  'tinh-cam': 'favorite',
  'tam-ly': 'psychology',
  'the-thao': 'sports',
  'phieu-luu': 'explore',
  'am-nhac': 'music-note',
  'gia-dinh': 'family-restroom',
  'hoc-duong': 'school',
  'hai-huoc': 'mood',
  'hinh-su': 'gavel',
  'vo-thuat': 'sports-martial-arts',
  'khoa-hoc': 'science',
  'than-thoai': 'auto-fix-high',
  'chinh-kich': 'theater-comedy',
  'kinh-dien': 'workspace-premium',
  'default': 'category'
};

const TYPE_ICONS: Record<string, string> = {
  'tvshows': 'tv',
  'series': 'live-tv',
  'single': 'movie',
  'hoathinh': 'animation',
  'default': 'devices'
};

export default function DiscoverModal({ 
  visible, 
  onClose, 
  onSelect, 
  onUnselect,
  hasActiveFilter = false 
}: DiscoverModalProps) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'genres' | 'types'>('genres');
  const [genres, setGenres] = useState<MovieGenre[]>([]);
  const [types, setTypes] = useState<MovieType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      fetchFilters();
    }
  }, [visible]);

  const fetchFilters = async () => {
    setIsLoading(true);
    try {
      const [genresData, typesData] = await Promise.all([
        getGenres(),
        getTypes()
      ]);
      setGenres(genresData);
      setTypes(typesData);
    } catch (error) {
      console.error("Error fetching filters:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (id: string, name: string, type: 'genre' | 'type') => {
    onSelect(id, name, type);
    onClose();
  };

  const handleUnselect = () => {
    if (onUnselect) {
      onUnselect();
      onClose();
    }
  };

  const getFilteredItems = () => {
    return activeTab === 'genres' ? genres : types;
  };

  const getIconName = (name: string, slug: string, isGenre: boolean) => {
    if (isGenre) {
      return GENRE_ICONS[slug] || GENRE_ICONS.default;
    } else {
      return TYPE_ICONS[slug] || TYPE_ICONS.default;
    }
  };

  const getGradientColors = (index: number, isGenre: boolean): [string, string] => {
    if (isGenre) {
      const palettes: [string, string][] = [
        ['#FF5F6D', '#FFC371'],
        ['#2193b0', '#6dd5ed'],
        ['#834d9b', '#d04ed6'],
        ['#4b6cb7', '#182848'],
        ['#11998e', '#38ef7d'],
        ['#FC466B', '#3F5EFB'],
        ['#F09819', '#EDDE5D'],
        ['#3A1C71', '#D76D77'],
      ];
      return palettes[index % palettes.length];
    } else {
      return ['#1A2980', '#26D0CE'];
    }
  };

  return (
    <AlertDialog isOpen={visible}>
      <AlertDialogBackdrop onPress={onClose} className="bg-black/70" />
      <AlertDialogContent 
        className="m-0 p-0 border-0 rounded-3xl bg-transparent overflow-hidden w-[85%] mx-auto"
        style={{ maxHeight: '80%' }}
      >
        <BlurView intensity={25} tint="dark" className="w-full h-full">
          <LinearGradient
            colors={['rgba(18,18,24,0.97)', 'rgba(10,10,14,0.98)']}
            className="w-full h-full rounded-3xl overflow-hidden"
          >
            <View className="px-5 pt-5 pb-3">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-2xl font-bold text-primary-500">
                  {activeTab === 'genres' ? 'Thể loại phim' : 'Loại phim'}
                </Text>
                <TouchableOpacity 
                  onPress={onClose}
                  className="w-9 h-9 rounded-full bg-zinc-800/80 items-center justify-center"
                >
                  <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="mx-5 mb-3">
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                className="flex-row"
              >
                <TouchableOpacity 
                  className={`py-2 px-5 rounded-full mr-3 ${activeTab === 'genres' ? 'bg-primary-500' : 'bg-zinc-800/60'}`}
                  onPress={() => setActiveTab('genres')}
                >
                  <Text className={`font-medium ${activeTab === 'genres' ? 'text-white' : 'text-zinc-400'}`}>
                    Thể loại
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className={`py-2 px-5 rounded-full mr-3 ${activeTab === 'types' ? 'bg-primary-500' : 'bg-zinc-800/60'}`}
                  onPress={() => setActiveTab('types')}
                >
                  <Text className={`font-medium ${activeTab === 'types' ? 'text-white' : 'text-zinc-400'}`}>
                    Loại phim
                  </Text>
                </TouchableOpacity>
                
                {hasActiveFilter && onUnselect && (
                  <TouchableOpacity
                    className="py-2 px-5 rounded-full bg-zinc-700/80 flex-row items-center"
                    onPress={handleUnselect}
                  >
                    <Ionicons name="close-circle-outline" size={16} color="#fff" />
                    <Text className="text-white text-sm ml-1">Bỏ chọn</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>

            <AlertDialogBody className="p-0 flex-1">
              {isLoading ? (
                <View className="flex-1 items-center mt-16">
                  <ActivityIndicator size="large" color={LOADING.INDICATOR_COLOR} />
                  <Text className="text-zinc-400 mt-3">Đang tải dữ liệu...</Text>
                </View>
              ) : (
                <ScrollView 
                  className="px-4"
                  contentContainerStyle={{ 
                    paddingBottom: insets.bottom || 20,
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between'
                  }}
                  showsVerticalScrollIndicator={false}
                >
                  {getFilteredItems().map((item, index) => {
                    const isGenre = activeTab === 'genres';
                    const iconName = getIconName(item.name, item.slug, isGenre);
                    const gradientColors = getGradientColors(index, isGenre);
                    
                    return (
                      <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.7}
                        onPress={() => handleSelect(item.id, item.name, isGenre ? 'genre' : 'type')}
                        className="mb-3 overflow-hidden rounded-2xl shadow-lg"
                        style={{ width: ITEM_SIZE }}
                      >
                        <LinearGradient
                          colors={gradientColors}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          className="w-full aspect-square items-center justify-center p-2"
                        >
                          <View className="w-12 h-12 rounded-full items-center justify-center">
                            <MaterialIcons name={iconName as any} size={24} color="white" />
                          </View>
                          <Text 
                            className="text-white font-medium text-center" 
                            numberOfLines={2}
                            style={{ fontSize: 13 }}
                          >
                            {item.name}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </AlertDialogBody>
          </LinearGradient>
        </BlurView>
      </AlertDialogContent>
    </AlertDialog>
  );
}