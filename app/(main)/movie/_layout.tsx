import React from 'react';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function MovieLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === 'ios' ? 'slide_from_right' : 'fade',
        contentStyle: { backgroundColor: '#000' },
        presentation: 'card',
        header: () => null
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          gestureEnabled: true,
          animationTypeForReplace: 'push',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]/episode/[episodeId]"
        options={{
          presentation: 'fullScreenModal',
          animation: 'fade',
          gestureEnabled: Platform.OS === 'ios',
          fullScreenGestureEnabled: true,
          headerShown: false,
        }}
      />
    </Stack>
  );
}