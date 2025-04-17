import React, { useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { MovieBase } from '@/types/movie-type';
import FeaturedMovieCard from './featured-movie-card';
import {
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
  const { width, height } = useWindowDimensions();
  
  const isLandscape = width > height;
  
  const carouselWidth = width;
  const carouselHeight = isLandscape 
    ? height * 0.7
    : width * 0.75;
  
  const maxVisibleDots = isLandscape ? 5 : movies.length;
  
  const renderCarouselItem = ({ item, index }: CarouselRenderItemInfo) => {
    return (
      <View style={{ 
        width: carouselWidth, 
        height: carouselHeight,
        borderRadius: isLandscape ? 12 : 0,
        overflow: 'hidden', 
      }}>
        <FeaturedMovieCard
          movie={item}
          index={index}
          style={{ width: carouselWidth }}
          isLandscape={isLandscape}
        />
      </View>
    );
  };

  if (!movies || movies.length === 0) {
    return null;
  }

  const renderPaginationDots = () => {
    if (isLandscape && movies.length > maxVisibleDots) {
      const halfVisible = Math.floor(maxVisibleDots / 2);
      let startIdx = currentIndex - halfVisible;
      let endIdx = currentIndex + halfVisible;
      
      if (startIdx < 0) {
        endIdx += Math.abs(startIdx);
        startIdx = 0;
      }
      if (endIdx >= movies.length) {
        startIdx = Math.max(0, startIdx - (endIdx - movies.length + 1));
        endIdx = movies.length - 1;
      }
      
      const visibleDots = [];
      
      if (startIdx > 0) {
        visibleDots.push(
          <View 
            key="leading-dots"
            style={{
              width: PAGINATION.DOT_WIDTH * 3,
              height: PAGINATION.DOT_HEIGHT,
              borderRadius: PAGINATION.DOT_BORDER_RADIUS,
              marginHorizontal: PAGINATION.DOT_MARGIN,
              backgroundColor: PAGINATION.INACTIVE_COLOR,
            }}
          />
        );
      }
      
      for (let i = startIdx; i <= endIdx; i++) {
        visibleDots.push(
          <View
            key={i}
            style={{
              width: i === currentIndex % movies.length ? PAGINATION.DOT_WIDTH * 2.5 : PAGINATION.DOT_WIDTH,
              height: PAGINATION.DOT_HEIGHT,
              borderRadius: PAGINATION.DOT_BORDER_RADIUS,
              marginHorizontal: PAGINATION.DOT_MARGIN,
              backgroundColor: i === currentIndex % movies.length ? NETFLIX_RED : PAGINATION.INACTIVE_COLOR,
            }}
          />
        );
      }
      
      if (endIdx < movies.length - 1) {
        visibleDots.push(
          <View 
            key="trailing-dots"
            style={{
              width: PAGINATION.DOT_WIDTH * 3,
              height: PAGINATION.DOT_HEIGHT,
              borderRadius: PAGINATION.DOT_BORDER_RADIUS,
              marginHorizontal: PAGINATION.DOT_MARGIN,
              backgroundColor: PAGINATION.INACTIVE_COLOR,
            }}
          />
        );
      }
      
      return visibleDots;
    }
    
    return movies.map((_, index) => (
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
    ));
  };

  return (
    <View className={`mb-4 ${isLandscape ? 'mt-0' : 'mt-4'}`}>
      <Carousel
        loop
        width={carouselWidth}
        height={carouselHeight}
        data={movies}
        autoPlay={true}
        autoPlayInterval={CAROUSEL_AUTO_PLAY_INTERVAL}
        scrollAnimationDuration={200}
        renderItem={renderCarouselItem}
        windowSize={2}
        enabled={!isRefreshing}
        onSnapToItem={(index) => setCurrentIndex(index)}
        mode={isLandscape ? "parallax" : undefined}
        modeConfig={isLandscape ? {
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
        } : undefined}
      />

      {/* Pagination dots with landscape optimization */}
      <View className={`flex-row justify-center items-center ${isLandscape ? 'mt-1' : '-mt-6'} h-2.5`}>
        {renderPaginationDots()}
      </View>
    </View>
  );
};

export default FeaturedCarousel;