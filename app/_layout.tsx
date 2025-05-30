import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '@/global.css';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from '@/providers/auth-context';
import { ModalProvider } from '@/providers/modal-provider';
import { DownloadProvider } from '@/providers/download-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <DownloadProvider>
          <GluestackUIProvider mode="dark">
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'fade',
              }}
            >
              {/* Define the main stack groups */}
              <Stack.Screen
                name="(auth)"
                options={{
                  title: 'Authentication',
                }}
              />
              <Stack.Screen
                name="(main)"
                options={{
                  title: 'Main App',
                  headerBackVisible: false,
                }}
              />

              {/* Redirect from root */}
              <Stack.Screen
                name="index"
                options={{
                  title: 'Index',
                }}
              />
            </Stack>
            {/* Global modals */}
            <ModalProvider />
            <StatusBar style="auto" />
          </GluestackUIProvider>
        </DownloadProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
