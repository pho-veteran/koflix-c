import * as FileSystem from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import NetInfo from '@react-native-community/netinfo';
import { FFmpegKit, ReturnCode } from 'ffmpeg-kit-react-native';
import { Platform } from 'react-native';

// --- Configuration ---
const DOWNLOAD_DIR = FileSystem.documentDirectory + 'downloads/';
const MAX_CONCURRENT_DOWNLOADS = 2;

// --- Types ---
export enum DownloadStatus {
  PENDING = 'pending',
  DOWNLOADING = 'downloading',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface DownloadTask {
  id: string;
  m3u8Url: string;
  title: string;
  posterUrl?: string;
  thumbUrl?: string;
  filePath: string;
  status: DownloadStatus;
  ffmpegSessionId?: number;
  error?: string;
  createdAt: number;
  
  // Updated episode-related fields with specific properties instead of server object
  episodeData?: {
    movieId?: string;
    movieName?: string;
    episodeId?: string;
    episodeName?: string;
    episodeServerId?: string;
    episodeServerFileName?: string;
  };
}

// --- State ---
let downloadQueue: { [id: string]: DownloadTask } = {};
let activeDownloadCount = 0;
let isInitialized = false;
let progressUpdateInterval: NodeJS.Timeout | null = null;

// --- Helper Functions ---

const ensureDownloadDirExists = async () => {
  const dirInfo = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
  if (!dirInfo.exists) {
    console.log('Creating download directory:', DOWNLOAD_DIR);
    await FileSystem.makeDirectoryAsync(DOWNLOAD_DIR, { intermediates: true });
  }
};

const generateFilename = (title: string) => {
  return title.replace(/[^a-zA-Z0-9-_.]/g, '_') + '.mp4';
};

const updateTaskState = (taskId: string, updates: Partial<DownloadTask>) => {
  if (downloadQueue[taskId]) {
    downloadQueue[taskId] = { ...downloadQueue[taskId], ...updates };
    // TODO: Notify UI listeners about the update
    console.log(`Task ${taskId} updated:`, downloadQueue[taskId].status);
  }
};

// --- Notification Handling ---
const NOTIFICATION_CHANNEL_ID = 'download_channel';

const configureNotifications = async () => {
  try {
    // Request permissions with the right settings for each platform
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
    
    if (status !== 'granted') {
      console.warn('Notification permissions not granted');
      return false;
    }

    // Set up notification categories/actions for iOS
    await Notifications.setNotificationCategoryAsync('download', [
      {
        identifier: 'cancel',
        buttonTitle: 'Hủy tải xuống',
        options: {
          isDestructive: true,
        },
      },
      {
        identifier: 'view',
        buttonTitle: 'Xem',
      },
    ]);

    // Set up notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
        name: 'Thông báo tải xuống',
        description: 'Thông báo về tình trạng tải xuống',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error configuring notifications:', error);
    return false;
  }
};

const sendProgressNotification = async (task: DownloadTask) => {
  try {
    // Check if we should show notification based on permission status
    const { status } = await Notifications.getPermissionsAsync();
    
    // Skip notification if permissions aren't granted
    if (status !== 'granted') {
      console.log(`Skipping notification for task ${task.id} - no permissions`);
      return false;
    }

    // Add an identifier prefix to avoid collisions
    const notificationId = `download_progress_${task.id}`;
    
    // Cancel any existing notification for this task
    await Notifications.dismissNotificationAsync(notificationId).catch(() => {});
    
    await Notifications.scheduleNotificationAsync({
      identifier: notificationId,
      content: {
        title: `Đang tải xuống: ${task.title}`,
        body: `Đang tải xuống...`,
        data: { taskId: task.id, type: 'progress' },
        sound: false,
        priority: Notifications.AndroidNotificationPriority.LOW,
        ...(Platform.OS === 'android' && { channelId: NOTIFICATION_CHANNEL_ID }),
      },
      trigger: null,
    });
    
    return true;
  } catch (error) {
    console.error(`Error sending progress notification for task ${task.id}:`, error);
    return false;
  }
};

const sendCompletionNotification = async (task: DownloadTask, success: boolean) => {
  try {
    // Always show completion notifications even in background
    
    // Add an identifier prefix to avoid collisions
    const notificationId = `download_complete_${task.id}`;
    
    // Clear any progress notifications
    await Notifications.dismissNotificationAsync(`download_progress_${task.id}`).catch(() => {});
    
    const unknownErrorMsg = 'Đã xảy ra lỗi không xác định.';
    
    await Notifications.scheduleNotificationAsync({
      identifier: notificationId,
      content: {
        title: success ? `Tải xuống hoàn tất: ${task.title}` : `Tải xuống thất bại: ${task.title}`,
        body: success ? 'Nhấn để xem.' : task.error || unknownErrorMsg,
        data: { 
          taskId: task.id, 
          filePath: task.filePath,
          type: 'completion',
          success
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        ...(Platform.OS === 'android' && { channelId: NOTIFICATION_CHANNEL_ID }),
      },
      trigger: null,
    });
    
    return true;
  } catch (error) {
    console.error(`Error sending completion notification for task ${task.id}:`, error);
    return false;
  }
};

// --- Core Download Logic ---

const processNextDownload = () => {
  if (activeDownloadCount >= MAX_CONCURRENT_DOWNLOADS) {
    return;
  }

  const pendingTask = Object.values(downloadQueue).find(
    (task) => task.status === DownloadStatus.PENDING
  );

  if (pendingTask) {
    startFFmpegDownload(pendingTask.id);
  }
};

const startFFmpegDownload = async (taskId: string) => {
  const task = downloadQueue[taskId];
  if (!task || task.status !== DownloadStatus.PENDING) {
    console.warn(`Task ${taskId} not found or not pending.`);
    processNextDownload();
    return;
  }

  const netState = await NetInfo.fetch();
  if (!netState.isConnected || netState.type !== 'wifi') {
     console.warn(`Task ${taskId} starting without Wi-Fi.`);
  }

  activeDownloadCount++;
  updateTaskState(taskId, { status: DownloadStatus.DOWNLOADING, error: undefined });
  await sendProgressNotification(task);

  const command = `-i "${task.m3u8Url}" -c copy -bsf:a aac_adtstoasc "${task.filePath}"`;

  console.log(`Starting FFmpeg for task ${taskId}: ${command}`);

  try {
    const session = await FFmpegKit.executeAsync(
      command,
      async (session) => { // Completion callback
        const returnCode = await session.getReturnCode();
        const sessionId = session.getSessionId();
        const completedTask = downloadQueue[taskId];

        activeDownloadCount--;

        if (ReturnCode.isSuccess(returnCode)) {
          console.log(`FFmpeg task ${taskId} (Session ${sessionId}) completed successfully.`);
          updateTaskState(taskId, { status: DownloadStatus.COMPLETED, ffmpegSessionId: undefined });
          await sendCompletionNotification(completedTask, true);
        } else if (ReturnCode.isCancel(returnCode)) {
          console.log(`FFmpeg task ${taskId} (Session ${sessionId}) cancelled.`);
          updateTaskState(taskId, { status: DownloadStatus.CANCELLED, ffmpegSessionId: undefined });
          await Notifications.dismissNotificationAsync(taskId);
        } else {
          const errorLogs = await session.getLogsAsString();
          console.error(`FFmpeg task ${taskId} (Session ${sessionId}) failed. Return code: ${returnCode}`);
          console.error("FFmpeg Logs:", errorLogs);
          const errorMsg = `FFmpeg failed with code ${returnCode}.`;
          updateTaskState(taskId, { status: DownloadStatus.FAILED, error: errorMsg, ffmpegSessionId: undefined });
          await sendCompletionNotification(completedTask, false);
        }
        processNextDownload();
      },
      (log) => { // Log callback
        // console.log(`FFmpeg log for ${taskId}:`, log.getMessage());
      },
      (statistics) => { // Statistics callback (for progress)
        // We're no longer tracking progress percentage
      }
    );

    updateTaskState(taskId, { ffmpegSessionId: session.getSessionId() });

  } catch (error) {
    activeDownloadCount--;
    console.error(`Error starting FFmpeg task ${taskId}:`, error);
    updateTaskState(taskId, { status: DownloadStatus.FAILED, error: 'Failed to start FFmpeg process.' });
    await sendCompletionNotification(task, false);
    processNextDownload();
  }
};

// Updated to only handle status updates without progress
const scheduleProgressNotifications = () => {
  if (progressUpdateInterval) clearInterval(progressUpdateInterval);

  progressUpdateInterval = setInterval(async () => {
    const downloadingTasks = Object.values(downloadQueue).filter(
      task => task.status === DownloadStatus.DOWNLOADING
    );
    
    if (downloadingTasks.length === 0) return;
    
    for (const task of downloadingTasks) {
      try {
        await sendProgressNotification(task);
      } catch (error) {
        console.error(`Failed to send progress notification for ${task.id}:`, error);
      }
    }
  }, 3000); // Update notifications every 3 seconds to avoid too many updates
};

// --- Public API ---

export const initializeDownloadService = async () => {
  if (isInitialized) return;
  console.log('Initializing Download Service...');
  await ensureDownloadDirExists();
  await configureNotifications();
  scheduleProgressNotifications();
  isInitialized = true;
  console.log('Download Service Initialized.');
};

export const startDownload = async (
  id: string,
  m3u8Url: string,
  title: string,
  posterUrl?: string,
  episodeData?: DownloadTask['episodeData'],
  thumbUrl?: string
): Promise<string | null> => {
  if (!isInitialized) {
    console.error('Download service not initialized.');
    return null;
  }
  if (downloadQueue[id]) {
    console.warn(`Download task ${id} already exists with status: ${downloadQueue[id].status}`);
    return id;
  }

  const filename = generateFilename(title);
  const filePath = DOWNLOAD_DIR + filename;

  const fileInfo = await FileSystem.getInfoAsync(filePath);
  if (fileInfo.exists) {
      console.log(`File already exists for task ${id}: ${filePath}`);
      downloadQueue[id] = {
          id, m3u8Url, title, posterUrl, thumbUrl, filePath,
          status: DownloadStatus.COMPLETED,
          createdAt: Date.now(),
          episodeData,
      };
      return id;
  }

  const newTask: DownloadTask = {
    id,
    m3u8Url,
    title,
    posterUrl,
    thumbUrl,
    filePath,
    status: DownloadStatus.PENDING,
    createdAt: Date.now(),
    episodeData,
  };

  downloadQueue[id] = newTask;
  console.log(`Task ${id} added to queue.`);
  processNextDownload();

  return id;
};

export const cancelDownload = async (taskId: string) => {
  const task = downloadQueue[taskId];
  if (!task) return;

  if (task.ffmpegSessionId) {
    console.log(`Cancelling FFmpeg session ${task.ffmpegSessionId} for task ${taskId}`);
    await FFmpegKit.cancel(task.ffmpegSessionId);
  } else if (task.status === DownloadStatus.PENDING) {
    updateTaskState(taskId, { status: DownloadStatus.CANCELLED });
    await Notifications.dismissNotificationAsync(taskId);
  }

  try {
    await FileSystem.deleteAsync(task.filePath, { idempotent: true });
    console.log(`Deleted partial file for cancelled task ${taskId}: ${task.filePath}`);
  } catch (error) {
    console.warn(`Could not delete partial file for ${taskId}:`, error);
  }
};

export const getDownloadStatus = (taskId: string): DownloadTask | null => {
  return downloadQueue[taskId] || null;
};

export const getAllDownloads = (): DownloadTask[] => {
  return Object.values(downloadQueue);
};

export const deleteDownloadedFile = async (taskId: string): Promise<boolean> => {
    const task = downloadQueue[taskId];
    if (!task) {
        console.error(`Task ${taskId} not found for deletion.`);
        return false;
    }

    try {
        await FileSystem.deleteAsync(task.filePath, { idempotent: true });
        console.log(`Deleted file for task ${taskId}: ${task.filePath}`);
        delete downloadQueue[taskId];
        return true;
    } catch (error) {
        console.error(`Failed to delete file for ${taskId}:`, error);
        return false;
    }
};

// --- Cleanup ---
export const cleanupDownloadService = () => {
    if (progressUpdateInterval) {
        clearInterval(progressUpdateInterval);
        progressUpdateInterval = null;
    }
    Object.values(downloadQueue).forEach(task => {
        if (task.status === DownloadStatus.DOWNLOADING && task.ffmpegSessionId) {
            FFmpegKit.cancel(task.ffmpegSessionId);
        }
    });
    isInitialized = false;
    console.log('Download Service Cleaned Up.');
};