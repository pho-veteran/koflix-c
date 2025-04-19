import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import * as DownloadService from '@/services/download-service';
import * as StorageService from '@/services/storage-service';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { DownloadTask } from '@/types/download-type';
import { useAuth } from './auth-context';

interface DownloadContextType {
  isInitialized: boolean;
  downloads: DownloadTask[];
  userDownloads: DownloadTask[];
  refreshDownloads: () => Promise<void>;
  userId: string;
}

const DownloadContext = createContext<DownloadContextType>({
  isInitialized: false,
  downloads: [],
  userDownloads: [],
  refreshDownloads: async () => { },
  userId: '',
});

export const useDownload = () => useContext(DownloadContext);

interface DownloadProviderProps {
  children: ReactNode;
}

export const DownloadProvider: React.FC<DownloadProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [downloads, setDownloads] = useState<DownloadTask[]>([]);
  const [userDownloads, setUserDownloads] = useState<DownloadTask[]>([]);
  const router = useRouter();
  const { firebaseUser } = useAuth();
  const userId = firebaseUser?.uid || '';

  // Notification Handling Effect
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        return {
          shouldShowAlert: true,
          shouldPlaySound: notification.request.content.data?.type === 'completion',
          shouldSetBadge: false,
        };
      },
    });

    const notificationResponseListener = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;

      if (data?.type === 'completion' && data?.success === true) {
        router.push('/(main)/(tabs)/downloaded');
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationResponseListener);
    };
  }, [router]);

  // Function to refresh downloads state
  const refreshDownloads = useCallback(async () => {
    if (!isInitialized) {
      return;
    }
    try {
      // Get all downloads
      const currentDownloads = DownloadService.getAllDownloads();
      setDownloads(currentDownloads);
      
      // Filter downloads for current user
      if (userId) {
        const currentUserDownloads = currentDownloads.filter(task => task.userId === userId);
        setUserDownloads(currentUserDownloads);
      } else {
        setUserDownloads([]);
      }
    } catch (error) {
      console.error("Failed to refresh downloads:", error);
    }
  }, [isInitialized, userId]);

  // Initialization Effect
  useEffect(() => {
    let isMounted = true;
    const initializeService = async () => {
      try {
        await DownloadService.initializeDownloadService();
        if (isMounted) {
          setIsInitialized(true);
          await refreshDownloads();
        }
      } catch (error) {
        console.error('Failed to initialize download service:', error);
      }
    };

    initializeService();

    return () => {
      isMounted = false;
      DownloadService.cleanupDownloadService();
    };
  }, [refreshDownloads]);

  // Effect to Listen for Download Data Changes
  useEffect(() => {
    if (!isInitialized) return;

    // Subscribe to changes emitted by StorageService
    const unsubscribe = StorageService.subscribeToDownloadDataChanges(() => {
      refreshDownloads();
    });

    return () => {
      unsubscribe();
    };
  }, [isInitialized, refreshDownloads]);
  
  // Effect to update user-specific downloads when user changes
  useEffect(() => {
    if (isInitialized) {
      refreshDownloads();
    }
  }, [userId, isInitialized, refreshDownloads]);

  return (
    <DownloadContext.Provider value={{ 
      isInitialized, 
      downloads, 
      userDownloads,
      refreshDownloads,
      userId
    }}>
      {children}
    </DownloadContext.Provider>
  );
};