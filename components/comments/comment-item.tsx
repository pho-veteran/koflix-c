import React, { useState } from 'react';
import { View, TouchableOpacity, Pressable, Image } from 'react-native';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Comment } from '@/types/user-movie-type';
import ReplySection from './reply-section';

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, currentUserId }) => {
  const [showReplies, setShowReplies] = useState(false);

  const formattedDate = comment.createdAt
    ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi })
    : '';

  const toggleReplies = () => {
    setShowReplies(prev => !prev);
  };

  return (
    <Pressable
      delayLongPress={300}
      className="mb-3"
    >
      <View className="bg-secondary-200/10 rounded-lg p-3">
        <HStack className="items-start">
          {/* User avatar */}
          <View className="h-9 w-9 rounded-full bg-primary-500/30 items-center justify-center mr-3 mt-0.5">
            {comment.user.avatarUrl ? (
              <Image 
                source={{ uri: comment.user.avatarUrl }} 
                className="h-9 w-9 rounded-full"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-primary-500 font-bold">
                {comment.user.name?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            )}
          </View>

          {/* Comment content */}
          <VStack className="flex-1">
            <HStack className="items-center mb-1 flex-wrap">
              <Text className="font-medium text-typography-800 mr-2">
                {comment.user.name || 'Người dùng'}
              </Text>
              <Text className="text-xs text-typography-500">
                {formattedDate}
              </Text>
            </HStack>

            <Text className="text-typography-700 text-sm mb-2">
              {comment.content}
            </Text>

            {/* Comment actions */}
            <HStack className="mt-1">
              <TouchableOpacity
                className="flex-row items-center mr-5 py-1"
                onPress={toggleReplies}
              >
                <Ionicons
                  name={showReplies ? "chatbubble" : "chatbubble-outline"}
                  size={14}
                  color={showReplies ? "#f43f5e" : "#9ca3af"}
                />
                <Text className={`text-xs ml-1 ${showReplies ? "text-primary-400" : "text-typography-600"}`}>
                  {comment.replyCount || 0} phản hồi
                </Text>
              </TouchableOpacity>
            </HStack>
          </VStack>
        </HStack>

        {/* Replies section */}
        {showReplies && (
          <ReplySection
            commentId={comment.id}
            currentUserId={currentUserId}
          />
        )}
      </View>
    </Pressable>
  );
};

export default CommentItem;