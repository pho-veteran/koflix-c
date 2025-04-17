import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Ionicons } from '@expo/vector-icons';
import { getComments } from '@/api/user-movie';
import { Comment } from '@/types/user-movie-type';
import CommentItem from './CommentItem';
import CommentInput from './CommentInput';
import { useAuth } from '@/providers/auth-context';
import { useRouter } from 'expo-router';

interface CommentListProps {
  movieId?: string;
  episodeId?: string;
  limit?: number;
  maxHeight?: number | string;
}

const CommentList: React.FC<CommentListProps> = ({ 
  movieId, 
  episodeId, 
  limit = 10,
  maxHeight = 'auto'
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const containerStyle = StyleSheet.create({
    listContainer: {
      width: '100%'
    }
  });

  useEffect(() => {
    fetchComments(1, true);
  }, [movieId, episodeId]);

  // Fade in animation
  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
    }
  }, [loading]);

  const fetchComments = async (pageNum = 1, reset = false) => {
    if (reset) {
      setLoading(true);
      fadeAnim.setValue(0);
    } else if (pageNum > 1) {
      setRefreshing(true);
    }
    
    try {
      const result = await getComments({
        movieId, 
        episodeId,
        page: pageNum,
        limit
      });
      
      if (result) {
        if (reset || pageNum === 1) {
          setComments(result.data);
        } else {
          setComments(prev => [...prev, ...result.data]);
        }
        
        setHasMore(result.pagination.hasNextPage);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Add a new comment directly to the UI
  const handleAddNewComment = (newComment: Comment) => {
    setComments(prevComments => [newComment, ...prevComments]);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading && !refreshing) {
      fetchComments(page + 1);
    }
  };

  const navigateToLogin = () => {
    router.push('/(auth)/login');
  };

  const renderEmptyComponent = () => {
    if (loading) return null;
    
    return (
      <View className="py-6 items-center">
        <Ionicons name="chatbubble-ellipses-outline" size={32} color="#9ca3af" />
        <Text className="text-typography-600 mt-2 text-center">
          Chưa có bình luận nào
        </Text>
        <Text className="text-typography-500 text-xs mt-1 text-center">
          Hãy là người đầu tiên bình luận!
        </Text>
      </View>
    );
  };

  return (
    <View className="py-4">
      {/* Header with comment count */}
      <HStack className="items-center justify-between mb-4">
        <Heading size="md" className="text-typography-950">
          Bình luận
        </Heading>
        {!loading && comments.length > 0 && (
          <Text className="text-typography-600 text-sm">
            {comments.length} bình luận
          </Text>
        )}
      </HStack>
      
      {/* Comment input section */}
      {user ? (
        <CommentInput 
          movieId={movieId} 
          episodeId={episodeId}
          onCommentAdded={handleAddNewComment}
        />
      ) : (
        <View className="bg-secondary-200/10 rounded-lg p-4 mb-4">
          <HStack className="items-center mb-2">
            <Ionicons name="lock-closed-outline" size={18} color="#9ca3af" className="mr-2" />
            <Text className="text-typography-600 text-sm ml-2">
              Đăng nhập để bình luận
            </Text>
          </HStack>
          <TouchableOpacity 
            className="bg-primary-400 px-4 py-2 rounded-full self-start mt-1"
            onPress={navigateToLogin}
          >
            <Text className="text-white text-sm font-medium">Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Comments list */}
      {loading ? (
        <View className="py-8 items-center">
          <ActivityIndicator size="large" color="#f43f5e" />
        </View>
      ) : (
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={containerStyle.listContainer}>
            <VStack space="md" className="mb-4">
              {comments.length > 0 ? (
                <>
                  {comments.map((item) => (
                    <CommentItem 
                      key={item.id} 
                      comment={item} 
                      currentUserId={user?.id} 
                    />
                  ))}
                  {refreshing && (
                    <View className="py-3 items-center">
                      <ActivityIndicator size="small" color="#f43f5e" />
                    </View>
                  )}
                  {hasMore && (
                    <TouchableOpacity 
                      className="py-3 items-center" 
                      onPress={() => handleLoadMore()}
                      disabled={refreshing}
                    >
                      <Text className="text-primary-600 font-medium">Xem thêm bình luận</Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                renderEmptyComponent()
              )}
            </VStack>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

export default CommentList;