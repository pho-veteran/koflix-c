import React, { useState } from 'react';
import { View, TouchableOpacity, Pressable } from 'react-native';
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
  const [showOptions, setShowOptions] = useState(false);
  
  const isCurrentUserComment = currentUserId && comment.userId === currentUserId;
  const formattedDate = comment.createdAt 
    ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi })
    : '';
    
  const handleLongPress = () => {
    setShowOptions(true);
  };
  
  const toggleReplies = () => {
    setShowReplies(prev => !prev);
  };

  return (
    <Pressable 
      onLongPress={handleLongPress} 
      delayLongPress={300}
      className="mb-3"
    >
      <View className="bg-secondary-200/10 rounded-lg p-3">
        <HStack className="items-start">
          {/* User avatar */}
          <View className="h-9 w-9 rounded-full bg-primary-500/30 items-center justify-center mr-3 mt-0.5">
            <Text className="text-primary-500 font-bold">
              {comment.user.name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
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
              
              {isCurrentUserComment && (
                <TouchableOpacity 
                  className="ml-auto p-1"
                  onPress={() => setShowOptions(!showOptions)}
                >
                  <Ionicons name="ellipsis-horizontal" size={16} color="#9ca3af" />
                </TouchableOpacity>
              )}
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
        
        {/* Options menu */}
        {showOptions && isCurrentUserComment && (
          <View className="absolute right-2 top-10 bg-secondary-300 rounded-lg p-2 shadow-md z-10">
            <TouchableOpacity className="flex-row items-center py-2 px-3">
              <Ionicons name="pencil-outline" size={16} color="#f9fafb" />
              <Text className="text-typography-800 text-sm ml-2">
                Sửa
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center py-2 px-3">
              <Ionicons name="trash-outline" size={16} color="#f43f5e" />
              <Text className="text-error-400 text-sm ml-2">
                Xóa
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
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