import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Pressable } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import { getReplies } from '@/api/user-movie';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Reply } from '@/types/user-movie-type';
import CommentInput from './comment-input'; 
import Animated, { FadeIn, SlideInLeft } from 'react-native-reanimated';

interface ReplySectionProps {
  commentId: string;
  currentUserId?: string;
}

const ReplySection: React.FC<ReplySectionProps> = ({ commentId, currentUserId }) => {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOptions, setShowOptions] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchReplies();
  }, [commentId]);

  const fetchReplies = async (pageNum = 1) => {
    setLoading(true);
    try {
      const result = await getReplies(commentId, pageNum);
      if (result) {
        if (pageNum === 1) {
          setReplies(result.data);
        } else {
          setReplies(prev => [...prev, ...result.data]);
        }
        setHasMore(result.pagination.hasNextPage);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchReplies(page + 1);
    }
  };

  const handleReplyAdded = async () => {
    await fetchReplies(1);
  };

  return (
    <Animated.View 
      entering={FadeIn.duration(300)}
      className="ml-10 mt-1 border-l-2 border-secondary-300/20 pl-3"
    >
      {/* Reply input */}
      <CommentInput 
        episodeId={undefined}
        movieId={undefined}
        onCommentAdded={handleReplyAdded}
        placeholder="Thêm phản hồi..."
        replyToComment={commentId}
      />
      
      {/* Replies list */}
      {loading ? (
        <ActivityIndicator size="small" color="#f43f5e" className="my-2" />
      ) : (
        <VStack>
          {replies.map((reply, index) => (
            <Animated.View 
              key={reply.id}
              entering={SlideInLeft.delay(index * 50).duration(300)} 
              className="mb-2"
            >
              <Pressable
                onLongPress={() => currentUserId === reply.userId && setShowOptions(reply.id)}
                delayLongPress={300}
              >
                <View className="bg-secondary-200/5 rounded-lg p-2">
                  <HStack className="items-start">
                    <View className="h-7 w-7 rounded-full bg-primary-500/20 items-center justify-center mr-2 mt-0.5">
                      <Text className="text-primary-500 text-xs font-bold">
                        {reply.user.name?.charAt(0)?.toUpperCase() || '?'}
                      </Text>
                    </View>
                    
                    <VStack className="flex-1">
                      <HStack className="items-center mb-1 flex-wrap">
                        <Text className="font-medium text-typography-800 text-sm mr-2">
                          {reply.user.name || 'Người dùng'}
                        </Text>
                        <Text className="text-xs text-typography-500">
                          {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true, locale: vi })}
                        </Text>
                        
                        {reply.userId === currentUserId && (
                          <TouchableOpacity 
                            className="ml-auto p-1"
                            onPress={() => setShowOptions(showOptions === reply.id ? null : reply.id)}
                          >
                            <Ionicons name="ellipsis-horizontal" size={14} color="#9ca3af" />
                          </TouchableOpacity>
                        )}
                      </HStack>
                      
                      <Text className="text-typography-700 text-sm">{reply.content}</Text>
                      
                      {/* Reply options menu */}
                      {showOptions === reply.id && (
                        <View className="absolute right-0 top-6 bg-secondary-300 rounded-lg p-1 shadow-md z-10">
                          <TouchableOpacity className="flex-row items-center py-1 px-2">
                            <Ionicons name="pencil-outline" size={14} color="#f9fafb" />
                            <Text className="text-typography-800 text-xs ml-1">
                              Sửa
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity className="flex-row items-center py-1 px-2">
                            <Ionicons name="trash-outline" size={14} color="#f43f5e" />
                            <Text className="text-error-400 text-xs ml-1">
                              Xóa
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </VStack>
                  </HStack>
                </View>
              </Pressable>
            </Animated.View>
          ))}
          
          {hasMore && (
            <TouchableOpacity 
              onPress={handleLoadMore}
              className="flex-row items-center justify-center py-2"
            >
              {loading ? (
                <ActivityIndicator size="small" color="#f43f5e" />
              ) : (
                <HStack className="items-center">
                  <Text className="text-primary-400 text-xs">Xem thêm phản hồi</Text>
                  <Ionicons name="chevron-down" size={14} color="#f43f5e" className="ml-1" />
                </HStack>
              )}
            </TouchableOpacity>
          )}
        </VStack>
      )}
    </Animated.View>
  );
};

export default ReplySection;