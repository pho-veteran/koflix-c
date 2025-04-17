import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as FileSystem from 'expo-file-system';
import Video from 'react-native-video';

import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { NETFLIX_RED } from '@/constants/ui-constants';
import * as DownloadService from '@/services/download-service';
import { DownloadStatus, DownloadTask } from '@/services/download-service';
import { useDownload } from '@/providers/download-context';

export default function DownloadedPage() {
    const [downloads, setDownloads] = useState<DownloadTask[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

    // Use the download context instead of initializing the service
    const { isInitialized, refreshDownloads } = useDownload();

    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { width } = Dimensions.get('window');
    const POSTER_WIDTH = width * 0.4;
    const POSTER_HEIGHT = POSTER_WIDTH * 1.5;

    // Load downloads when the component mounts or when initialized changes
    useEffect(() => {
        if (isInitialized) {
            loadDownloads();
            setIsLoading(false);
        }
    }, [isInitialized]);

    // Set up polling for updates
    useEffect(() => {
        const interval = setInterval(() => {
            if (!refreshing && isInitialized) loadDownloads(false);
        }, 2000);

        return () => clearInterval(interval);
    }, [refreshing, isInitialized]);

    const loadDownloads = async (showLoading = true) => {
        if (showLoading) setRefreshing(true);

        try {
            const allDownloads = DownloadService.getAllDownloads();

            // Sort: Downloading first, then completed, then others
            const sortedDownloads = allDownloads.sort((a, b) => {
                if (a.status === DownloadStatus.DOWNLOADING && b.status !== DownloadStatus.DOWNLOADING) return -1;
                if (a.status !== DownloadStatus.DOWNLOADING && b.status === DownloadStatus.DOWNLOADING) return 1;
                if (a.status === DownloadStatus.COMPLETED && b.status !== DownloadStatus.COMPLETED) return -1;
                if (a.status !== DownloadStatus.COMPLETED && b.status === DownloadStatus.COMPLETED) return 1;
                return b.createdAt - a.createdAt; // Most recent first
            });

            setDownloads(sortedDownloads);
            setError(null);
        } catch (err) {
            console.error('Error loading downloads:', err);
            setError('Không thể tải danh sách video đã tải xuống.');
        } finally {
            setRefreshing(false);
        }
    };

    const handleRefresh = async () => {
        // Use the context's refresh method to ensure service is initialized
        if (!isInitialized) {
            await refreshDownloads();
        }
        loadDownloads();
    };

    const handlePlayVideo = (downloadTask: DownloadTask) => {
        // For completed downloads, navigate to a video player screen
        if (downloadTask.status === DownloadStatus.COMPLETED) {
            const fileInfo = {
                uri: downloadTask.filePath,
                title: downloadTask.title,
                id: downloadTask.id
            };

            // Check if file exists before trying to play
            FileSystem.getInfoAsync(downloadTask.filePath).then(info => {
                if (info.exists) {
                    // Option 1: Play in the current list with a mini player
                    setPlayingVideoId(downloadTask.id);

                    // Option 2: Navigate to a full player screen
                    // router.push({
                    //   pathname: `/player`,
                    //   params: { uri: downloadTask.filePath, title: downloadTask.title }
                    // });
                } else {
                    Alert.alert(
                        'Lỗi tập tin',
                        'Không thể tìm thấy tệp video. Tệp có thể đã bị xóa.',
                        [
                            {
                                text: 'Xóa khỏi danh sách',
                                onPress: () => handleDeleteDownload(downloadTask)
                            },
                            { text: 'Đóng' }
                        ]
                    );
                }
            });
        }
    };

    // Navigate to movie detail page
    const handleOpenMovieDetail = (downloadTask: DownloadTask) => {
        if (downloadTask.episodeData?.movieId) {
            router.push(`/movie/${downloadTask.episodeData.movieId}`);
        }
    };

    const handleDeleteDownload = (downloadTask: DownloadTask) => {
        Alert.alert(
            'Xóa video',
            `Bạn có chắc chắn muốn xóa "${downloadTask.title}"?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        setRefreshing(true);
                        try {
                            if (downloadTask.status === DownloadStatus.DOWNLOADING ||
                                downloadTask.status === DownloadStatus.PENDING) {
                                await DownloadService.cancelDownload(downloadTask.id);
                            } else {
                                await DownloadService.deleteDownloadedFile(downloadTask.id);
                            }

                            // If this was the playing video, stop playback
                            if (playingVideoId === downloadTask.id) {
                                setPlayingVideoId(null);
                            }

                            // Refresh the list
                            await loadDownloads(false);
                        } catch (err) {
                            console.error('Error deleting download:', err);
                            Alert.alert('Lỗi', 'Không thể xóa video đã tải xuống.');
                        } finally {
                            setRefreshing(false);
                        }
                    }
                }
            ]
        );
    };

    const renderDownloadItem = ({ item }: { item: DownloadTask }) => {
        const isPlaying = playingVideoId === item.id;
        const hasEpisodeData = !!item.episodeData;

        return (
            <View style={styles.downloadItem}>
                <TouchableOpacity
                    style={styles.downloadCard}
                    onPress={() => handlePlayVideo(item)}
                    disabled={item.status !== DownloadStatus.COMPLETED}
                >
                    <View style={styles.posterContainer}>
                        {item.posterUrl ? (
                            <Image
                                source={{ uri: item.posterUrl }}
                                style={{ width: POSTER_WIDTH, height: POSTER_HEIGHT }}
                                contentFit="cover"
                                transition={300}
                            />
                        ) : (
                            <View
                                style={[
                                    styles.posterPlaceholder,
                                    { width: POSTER_WIDTH, height: POSTER_HEIGHT }
                                ]}
                            >
                                <Ionicons name="videocam" size={32} color="#555" />
                            </View>
                        )}

                        {/* Status overlay */}
                        {item.status === DownloadStatus.DOWNLOADING && (
                            <View style={styles.statusOverlay}>
                                <ActivityIndicator color={NETFLIX_RED} size="small" />
                                <Text style={styles.statusText}>
                                    Đang tải xuống...
                                </Text>
                            </View>
                        )}

                        {item.status === DownloadStatus.PENDING && (
                            <View style={styles.statusOverlay}>
                                <Text style={styles.statusText}>Đang chờ</Text>
                            </View>
                        )}

                        {item.status === DownloadStatus.FAILED && (
                            <View style={[styles.statusOverlay, styles.errorOverlay]}>
                                <Ionicons name="alert-circle" size={24} color="#ff4d4d" />
                                <Text style={styles.errorText}>Lỗi</Text>
                            </View>
                        )}

                        {item.status === DownloadStatus.COMPLETED && (
                            <View style={styles.playButton}>
                                <Ionicons name="play" size={28} color="#fff" />
                            </View>
                        )}
                    </View>

                    <VStack className="ml-3 flex-1 justify-between">
                        <Text numberOfLines={2} className="text-typography-800 font-semibold text-base mb-1">
                            {item.title}
                        </Text>

                        {/* Show movie info if available */}
                        {hasEpisodeData && item.episodeData?.movieName && (
                            <TouchableOpacity 
                                onPress={() => handleOpenMovieDetail(item)}
                                disabled={!item.episodeData?.movieId}
                            >
                                <Text numberOfLines={1} className="text-primary-400 text-xs">
                                    {item.episodeData.movieName}
                                </Text>
                            </TouchableOpacity>
                        )}

                        <HStack space="sm">
                            {item.status === DownloadStatus.COMPLETED && (
                                <Text className="text-typography-600 text-xs">
                                    Đã tải xuống
                                </Text>
                            )}

                            {item.status === DownloadStatus.DOWNLOADING && (
                                <Text className="text-primary-500 text-xs">
                                    Đang tải xuống...
                                </Text>
                            )}

                            {item.status === DownloadStatus.PENDING && (
                                <Text className="text-amber-500 text-xs">
                                    Đang chờ
                                </Text>
                            )}

                            {item.status === DownloadStatus.FAILED && (
                                <Text className="text-error-500 text-xs">
                                    Tải thất bại
                                </Text>
                            )}

                            {item.status === DownloadStatus.CANCELLED && (
                                <Text className="text-typography-600 text-xs">
                                    Đã hủy
                                </Text>
                            )}
                        </HStack>

                        <TouchableOpacity
                            onPress={() => handleDeleteDownload(item)}
                            style={styles.deleteButton}
                        >
                            <Ionicons
                                name={item.status === DownloadStatus.DOWNLOADING ? "stop-circle-outline" : "trash-outline"}
                                size={20}
                                color="#ff4d4d"
                            />
                            <Text className="text-error-500 text-xs ml-1">
                                {item.status === DownloadStatus.DOWNLOADING ? "Dừng" : "Xóa"}
                            </Text>
                        </TouchableOpacity>
                    </VStack>
                </TouchableOpacity>

                {/* Mini player when a video is selected for playback */}
                {isPlaying && (
                    <View style={styles.miniPlayer}>
                        <Video
                            source={{ uri: item.filePath }}
                            style={{ width: '100%', height: 200 }}
                            resizeMode="contain"
                            controls={true}
                            onError={(error) => {
                                console.error('Video playback error:', error);
                                Alert.alert(
                                    'Lỗi phát video',
                                    'Không thể phát video này. Tệp có thể bị lỗi.',
                                    [{ text: 'Đóng', onPress: () => setPlayingVideoId(null) }]
                                );
                            }}
                        />
                        <TouchableOpacity
                            style={styles.closePlayerButton}
                            onPress={() => setPlayingVideoId(null)}
                        >
                            <Ionicons name="close-circle" size={28} color="#fff" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    // Empty state for no downloads
    const renderEmptyList = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="cloud-download-outline" size={64} color="#555" />
            <Text className="text-typography-600 text-lg mt-4 mb-2 text-center">
                Chưa có video nào được tải xuống
            </Text>
            <Text className="text-typography-500 text-sm text-center">
                Các video bạn tải xuống sẽ xuất hiện ở đây
            </Text>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.container}>
                <StatusBar style="light" />
                <Stack.Screen options={{ title: 'Đã tải xuống' }} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={NETFLIX_RED} />
                    <Text className="text-typography-800 mt-4">Đang tải...</Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <StatusBar style="light" />
                <Stack.Screen options={{ title: 'Đã tải xuống' }} />
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color="#ff4d4d" />
                    <Text className="text-error-500 text-lg font-semibold mt-4 mb-2">{error}</Text>
                    <TouchableOpacity
                        className="bg-primary-500 rounded-md px-4 py-2 mt-4"
                        onPress={() => loadDownloads(true)}
                    >
                        <Text className="text-white font-medium">Thử lại</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <Stack.Screen options={{
                title: 'Đã tải xuống',
                headerStyle: { backgroundColor: '#000' },
                headerTintColor: '#fff'
            }} />

            <FlatList
                data={downloads}
                renderItem={renderDownloadItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={[
                    styles.listContent,
                    downloads.length === 0 && styles.emptyListContent
                ]}
                ListEmptyComponent={renderEmptyList}
                onRefresh={handleRefresh}
                refreshing={refreshing}
                style={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    list: {
        flex: 1,
    },
    listContent: {
        padding: 16,
    },
    emptyListContent: {
        flex: 1,
        justifyContent: 'center',
    },
    downloadItem: {
        marginBottom: 16,
        borderRadius: 8,
        overflow: 'hidden',
    },
    downloadCard: {
        flexDirection: 'row',
        backgroundColor: '#111',
        borderRadius: 8,
        overflow: 'hidden',
    },
    posterContainer: {
        position: 'relative',
    },
    posterPlaceholder: {
        backgroundColor: '#222',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorOverlay: {
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    statusText: {
        color: '#fff',
        marginLeft: 8,
        fontSize: 12,
    },
    errorText: {
        color: '#ff4d4d',
        marginLeft: 8,
        fontSize: 12,
    },
    playButton: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        alignSelf: 'flex-start',
    },
    miniPlayer: {
        width: '100%',
        marginTop: 8,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#000',
        position: 'relative',
    },
    closePlayerButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
});