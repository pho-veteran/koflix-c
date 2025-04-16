import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Ionicons } from '@expo/vector-icons';
import { UserInteractionData } from '@/types/movie';
import { postUserInteraction, InteractionType } from '@/api/user-movie';
import { useAuth } from '@/providers/auth-context';

interface MovieInteractionsProps {
  movieId: string;
  rating?: string | number;
  ratingCount?: number;
  viewCount?: number;
  likeCount?: number;
  userInteraction: UserInteractionData | null;
  onInteractionUpdate: (newInteraction: UserInteractionData) => void;
}

const MovieInteractions: React.FC<MovieInteractionsProps> = ({
  movieId,
  rating: initialRating = 0,
  ratingCount: initialRatingCount = 0,
  viewCount = 0,
  likeCount: initialLikeCount = 0,
  userInteraction,
  onInteractionUpdate,
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State to tracking user interactions
  const [displayedRating, setDisplayedRating] = useState<number>(Number(initialRating) || 0);
  const [displayedRatingCount, setDisplayedRatingCount] = useState(initialRatingCount);
  const [displayedLikeCount, setDisplayedLikeCount] = useState(initialLikeCount);
  
  useEffect(() => {
    setDisplayedRating(Number(initialRating) || 0);
    setDisplayedRatingCount(initialRatingCount);
    setDisplayedLikeCount(initialLikeCount);
  }, [initialRating, initialRatingCount, initialLikeCount]);
  
  // Default values if userInteraction is null
  const isLiked = userInteraction?.isLiked || false;
  const isDisliked = userInteraction?.isDisliked || false;
  const userRating = userInteraction?.rating || null;

  const handleLike = async () => {
    if (!user || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // Toggle off like if already liked
      const interactionType: InteractionType = isLiked ? "DISLIKE" : "LIKE";
      
      await postUserInteraction(user.id, movieId, interactionType);
      
      const newInteraction: UserInteractionData = {
        isLiked: !isLiked,
        isDisliked: false,
        rating: userRating,
      };
      
      if (isLiked) {
        setDisplayedLikeCount(prev => Math.max(0, prev - 1));
      } else {
        setDisplayedLikeCount(prev => prev + 1);
      }
      
      onInteractionUpdate(newInteraction);
    } catch (error) {
      console.error("Error updating like status:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDislike = async () => {
    if (!user || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const interactionType: InteractionType = isDisliked ? "LIKE" : "DISLIKE";
      
      await postUserInteraction(user.id, movieId, interactionType);
      
      const newInteraction: UserInteractionData = {
        isLiked: false,
        isDisliked: !isDisliked,
        rating: userRating,
      };
      
      if (isLiked && !isDisliked) {
        setDisplayedLikeCount(prev => Math.max(0, prev - 1));
      }
      
      onInteractionUpdate(newInteraction);
    } catch (error) {
      console.error("Error updating dislike status:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRate = async (rating: number) => {
    if (!user || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await postUserInteraction(user.id, movieId, "RATE", rating);
      
      const newInteraction: UserInteractionData = {
        isLiked: isLiked,
        isDisliked: isDisliked,
        rating: rating,
      };
      
      if (!userRating) {
        setDisplayedRatingCount(prev => prev + 1);
      }
      
      const oldTotalPoints = displayedRating * displayedRatingCount;
      const newTotalPoints = oldTotalPoints + (rating - (userRating || 0));
      const newAvgRating = displayedRatingCount > 0 
        ? newTotalPoints / displayedRatingCount 
        : rating;
        
      setDisplayedRating(Number(newAvgRating.toFixed(1)));
      
      onInteractionUpdate(newInteraction);
    } catch (error) {
      console.error("Error updating rating:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <VStack space="md" className="mt-1">
      {/* Movie Stats Section (from MovieStats) */}
      <View className="bg-secondary-200/10 rounded-lg p-3">
        <HStack className="justify-between">
          {/* Rating - always show */}
          <VStack className="items-center">
            <HStack space="xs" className="items-center">
              <Ionicons name="star" size={18} color="#F59E0B" />
              <Text className="text-typography-800 font-bold text-base">
                {displayedRating || "0"}
              </Text>
            </HStack>
            <Text className="text-typography-600 text-xs mt-1">
              {displayedRatingCount} đánh giá
            </Text>
          </VStack>
          
          {/* View count - always show */}
          <VStack className="items-center">
            <HStack space="xs" className="items-center">
              <Ionicons name="eye-outline" size={18} color="#9CA3AF" />
              <Text className="text-typography-800 font-bold text-base">
                {viewCount.toLocaleString()}
              </Text>
            </HStack>
            <Text className="text-typography-600 text-xs mt-1">
              lượt xem
            </Text>
          </VStack>
          
          {/* Likes - always show */}
          <VStack className="items-center">
            <HStack space="xs" className="items-center">
              <Ionicons name="thumbs-up" size={18} color="#10B981" />
              <Text className="text-typography-800 font-bold text-base">
                {displayedLikeCount}
              </Text>
            </HStack>
            <Text className="text-typography-600 text-xs mt-1">
              lượt thích
            </Text>
          </VStack>
        </HStack>
      </View>

      {/* User Interaction Section */}
      <VStack space="sm" className="bg-secondary-200/5 p-3 rounded-lg">
        <Heading size="sm" className="text-typography-950 mb-1">Đánh giá của bạn</Heading>
        
        {/* Like/Dislike buttons */}
        <HStack space="md" className="py-2">
          <TouchableOpacity 
            onPress={handleLike}
            disabled={isSubmitting}
            className={`flex-row items-center px-4 py-2 rounded-full ${isLiked ? 'bg-primary-500/20' : 'bg-secondary-200/10'}`}
          >
            <Ionicons 
              name={isLiked ? "thumbs-up" : "thumbs-up-outline"} 
              size={22} 
              color={isLiked ? "#f43f5e" : "#9ca3af"} 
            />
            <Text className={`ml-2 ${isLiked ? 'text-primary-500' : 'text-gray-400'}`}>Thích</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleDislike}
            disabled={isSubmitting}
            className={`flex-row items-center px-4 py-2 rounded-full ${isDisliked ? 'bg-secondary-200/20' : 'bg-secondary-200/10'}`}
          >
            <Ionicons 
              name={isDisliked ? "thumbs-down" : "thumbs-down-outline"} 
              size={22} 
              color={isDisliked ? "#94a3b8" : "#9ca3af"} 
            />
            <Text className={`ml-2 ${isDisliked ? 'text-gray-400' : 'text-gray-400'}`}>Không thích</Text>
          </TouchableOpacity>
        </HStack>
        
        {/* Rating stars */}
        <VStack space="xs" className="pt-1">
          <Text className="text-gray-400 text-sm">Đánh giá phim (0-5 sao):</Text>
          <HStack space="sm" className="py-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity 
                key={star}
                onPress={() => handleRate(star)}
                disabled={isSubmitting}
              >
                <Ionicons 
                  name={userRating && star <= userRating ? "star" : "star-outline"} 
                  size={28} 
                  color={userRating && star <= userRating ? "#f59e0b" : "#9ca3af"} 
                />
              </TouchableOpacity>
            ))}
          </HStack>
        </VStack>
      </VStack>
    </VStack>
  );
};

export default MovieInteractions;