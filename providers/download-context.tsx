import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as DownloadService from '@/services/download-service';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';

interface DownloadContextType {
  isInitialized: boolean;
  refreshDownloads: () => Promise<void>;
}

const DownloadContext = createContext<DownloadContextType>({
  isInitialized: false,
  refreshDownloads: async () => {},
});

export const useDownload = () => useContext(DownloadContext);

interface DownloadProviderProps {
  children: ReactNode;
}

export const DownloadProvider: React.FC<DownloadProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  
  // Configure notification handling
  useEffect(() => {
    // Set up the notification handler
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        return {
          shouldShowAlert: true,
          shouldPlaySound: notification.request.content.data?.type === 'completion',
          shouldSetBadge: false,
        };
      },
    });
    
    // Set up notification response handler to navigate when a notification is tapped
    const notificationResponseListener = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      
      // Handle different notification types
      if (data?.type === 'completion' && data?.success === true) {
        // If it's a successful completion notification, navigate to downloaded page
        router.push('/downloaded');
      }
    });
    
    return () => {
      // Clean up the listener
      Notifications.removeNotificationSubscription(notificationResponseListener);
    };
  }, []);
  
  // Initialize the download service when the app starts
  useEffect(() => {
    const initializeService = async () => {
      try {
        console.log('Initializing Download Service from provider...');
        await DownloadService.initializeDownloadService();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize download service:', error);
      }
    };

    initializeService();

    // Clean up when the app is closed
    return () => {
      DownloadService.cleanupDownloadService();
    };
  }, []);

  const refreshDownloads = async () => {
    // This is just a utility function to force update download data
    if (!isInitialized) {
      await DownloadService.initializeDownloadService();
      setIsInitialized(true);
    }
  };

  return (
    <DownloadContext.Provider value={{ isInitialized, refreshDownloads }}>
      {children}
    </DownloadContext.Provider>
  );
};