import React, { useState, useRef } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator, Keyboard } from 'react-native';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import { createComment, createReply } from '@/api/user-movie';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useAuth } from '@/providers/auth-context';
import { Comment } from '@/types/user-movie-type';

interface CommentInputProps {
    movieId?: string;
    episodeId?: string;
    onCommentAdded: (newComment: Comment) => void; 
    placeholder?: string;
    replyToComment?: string;
}

const CommentInput: React.FC<CommentInputProps> = ({
    movieId,
    episodeId,
    onCommentAdded,
    placeholder = "Thêm bình luận của bạn...",
    replyToComment
}) => {
    const { user } = useAuth();
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<TextInput>(null);

    const handleSubmit = async () => {
        if (!comment.trim() || isSubmitting || !user) return;

        setIsSubmitting(true);
        Keyboard.dismiss();

        try {
            let result;
            if (replyToComment) {
                result = await createReply(comment.trim(), replyToComment);
            } else {
                result = await createComment(comment.trim(), movieId, episodeId);
            }
            
            // Create a new comment object to add directly to the UI
            const newComment: Comment = {
                id: result?.id || `temp-${Date.now()}`,
                userId: user.id,
                content: comment.trim(),
                movieId: movieId || null,
                episodeId: episodeId || null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                user: {
                    id: user.id,
                    name: user.name || 'User',
                    avatarUrl: null
                },
                replyCount: 0
            };
            
            setComment('');
            onCommentAdded(newComment);
        } catch (error) {
            console.error('Error submitting comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'A';

    return (
        <View className="mb-4">
            {/* Main input container - increased height */}
            <HStack className="bg-secondary-300/20 rounded-2xl overflow-hidden pl-4 pr-2 py-2 items-center">
                {/* User avatar - increased size */}
                <View className="h-10 w-10 rounded-full bg-primary-500/20 items-center justify-center mr-3">
                    <Text className="text-primary-400 text-base font-medium">
                        {userInitial}
                    </Text>
                </View>

                {/* Input field - increased text size and padding */}
                <TextInput
                    ref={inputRef}
                    className={`flex-1 py-3 text-typography-800 text-base`}
                    placeholder={placeholder}
                    placeholderTextColor="#71717a"
                    value={comment}
                    onChangeText={setComment}
                    multiline
                    maxLength={500}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={{ minHeight: 44 }}
                />
            </HStack>

            {/* Action buttons when focused - increased size */}
            {isFocused && (
                <Animated.View
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(200)}
                    className="flex-row justify-end mt-3"
                >
                    <TouchableOpacity
                        className="bg-secondary-300/30 px-5 py-2 rounded-xl mr-3 items-center justify-center"
                        onPress={() => {
                            setComment('');
                            Keyboard.dismiss();
                            setIsFocused(false);
                        }}
                    >
                        <Text className="text-typography-700 text-sm font-medium">Hủy</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className={`px-4 py-3 rounded-xl items-center justify-center ${comment.trim() ? 'bg-primary-400' : 'bg-secondary-400/50'}`}
                        onPress={handleSubmit}
                        disabled={!comment.trim() || isSubmitting}
                        style={{ minWidth: 48 }}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Ionicons name="send" size={20} color={comment.trim() ? "#fff" : "#9ca3af"} />
                        )}
                    </TouchableOpacity>
                </Animated.View>
            )}
        </View>
    );
};

export default CommentInput;