import React, { useState } from 'react';
import { View } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { MovieBase } from '@/types/movie';
import FeaturedMovieCard from './featured-movie-card';
import {
  SCREEN_WIDTH,
  CAROUSEL_HEIGHT,
  NETFLIX_RED,
  PAGINATION,
  CAROUSEL_AUTO_PLAY_INTERVAL
} from '@/constants/ui-constants';

interface FeaturedCarouselProps {
  movies: MovieBase[];
  isRefreshing?: boolean;
}

interface CarouselRenderItemInfo {
  item: MovieBase;
  index: number;
}

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({
  movies,
  isRefreshing = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const renderCarouselItem = ({ item, index }: CarouselRenderItemInfo) => {
    return (
      <View style={{ width: SCREEN_WIDTH, height: CAROUSEL_HEIGHT }}>
        <FeaturedMovieCard
          movie={item}
          index={index}
          style={{ width: SCREEN_WIDTH }}
        />
      </View>
    );
  };

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <View className="mb-4">
      <Carousel
        loop
        width={SCREEN_WIDTH}
        height={CAROUSEL_HEIGHT}
        data={movies}
        autoPlay={true}
        autoPlayInterval={CAROUSEL_AUTO_PLAY_INTERVAL}
        scrollAnimationDuration={200}
        renderItem={renderCarouselItem}
        windowSize={2}
        enabled={!isRefreshing}
        onSnapToItem={(index) => setCurrentIndex(index)}
      />

      {/* Simple static pagination dots - show all dots */}
      <View className="flex-row justify-center items-center mt-2 h-2.5">
        {movies.map((_, index) => (
          <View
            key={index}
            style={{
              width: index === currentIndex % movies.length ? PAGINATION.DOT_WIDTH * 2.5 : PAGINATION.DOT_WIDTH,
              height: PAGINATION.DOT_HEIGHT,
              borderRadius: PAGINATION.DOT_BORDER_RADIUS,
              marginHorizontal: PAGINATION.DOT_MARGIN,
              backgroundColor: index === currentIndex % movies.length ? NETFLIX_RED : PAGINATION.INACTIVE_COLOR,
            }}
          />
        ))}
      </View>
    </View>
  );
};

export default FeaturedCarousel;