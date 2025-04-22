import { FFmpegKit, ReturnCode } from "ffmpeg-kit-react-native";
import NetInfo, {
    NetInfoState,
    NetInfoSubscription,
} from "@react-native-community/netinfo";
import * as FileSystem from "expo-file-system";
import * as StorageService from "./storage-service";
import * as NotificationService from "./notification-service";
import { DownloadStatus, DownloadTask } from "@/types/download-type";

const MAX_CONCURRENT_DOWNLOADS = 2;

let activeDownloadCount = 0;
let isInitialized = false;
let netInfoUnsubscribe: NetInfoSubscription | null = null;
let isConnected = true;

const processNextDownload = () => {
    if (activeDownloadCount >= MAX_CONCURRENT_DOWNLOADS || !isConnected) {
        return;
    }

    const waitingTasks = StorageService.getAllTasks().filter(
        (task) =>
            task.status === DownloadStatus.DOWNLOADING && 
            !task.ffmpegSessionId && 
            !task.downloadResumable
    );

    if (waitingTasks.length > 0) {
        const task = waitingTasks[0];
        if (task.m3u8Url) {
            startFFmpegDownload(task.id);
        } else if (task.mp4Url) {
            startDirectDownload(task.id);
        }
    }
};

const handleConnectivityChange = (state: NetInfoState) => {
    const previousState = isConnected;
    isConnected = state.isConnected === true;

    if (previousState && !isConnected) {
        const activeTasks = StorageService.getAllTasks().filter(
            (task) =>
                task.status === DownloadStatus.DOWNLOADING &&
                (task.ffmpegSessionId || task.downloadResumable)
        );

        activeTasks.forEach(async (task) => {
            if (task.ffmpegSessionId) {
                await FFmpegKit.cancel(task.ffmpegSessionId);
                StorageService.updateTaskState(task.id, {
                    status: DownloadStatus.CANCELLED,
                    error: "Download cancelled due to internet connection loss",
                    ffmpegSessionId: undefined,
                });
            } else if (task.downloadResumable) {
                await task.downloadResumable.pauseAsync();
                StorageService.updateTaskState(task.id, {
                    status: DownloadStatus.CANCELLED,
                    error: "Download cancelled due to internet connection loss",
                    downloadResumable: undefined,
                });
            }

            const updatedTask = StorageService.getTask(task.id);
            if (updatedTask) {
                await NotificationService.sendCancelledNotification(updatedTask);
            }
        });
    }
};

// Handle direct MP4 downloads using Expo FileSystem
const startDirectDownload = async (taskId: string) => {
    const task = StorageService.getTask(taskId);
    if (!task || task.status !== DownloadStatus.DOWNLOADING || !task.mp4Url) {
        console.warn(`Task ${taskId} not valid for direct download.`);
        processNextDownload();
        return;
    }

    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
        console.warn(`Cannot start download for task ${taskId}: No internet connection.`);
        StorageService.updateTaskState(taskId, {
            status: DownloadStatus.CANCELLED,
            error: "No internet connection available",
        });

        const cancelledTask = StorageService.getTask(taskId);
        if (cancelledTask) {
            await NotificationService.sendCancelledNotification(cancelledTask);
        }
        return;
    }

    activeDownloadCount++;
    await NotificationService.sendStateNotification(task);

    try {
        // Create a download resumable
        const downloadResumable = FileSystem.createDownloadResumable(
            task.mp4Url,
            task.filePath,
            {},
            (downloadProgress) => {
                const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
                StorageService.updateTaskState(taskId, { progress });
            }
        );

        // Store the downloadResumable in the task
        StorageService.updateTaskState(taskId, { downloadResumable });

        // Start the download
        const result = await downloadResumable.downloadAsync();
        
        if (result) {
            StorageService.updateTaskState(taskId, {
                status: DownloadStatus.COMPLETED,
                downloadResumable: undefined,
            });
            
            const completedTask = StorageService.getTask(taskId);
            if (completedTask) {
                await NotificationService.sendCompletionNotification(completedTask, true);
            }
        } else {
            StorageService.updateTaskState(taskId, {
                status: DownloadStatus.CANCELLED,
                error: "Download failed",
                downloadResumable: undefined,
            });
            
            const cancelledTask = StorageService.getTask(taskId);
            if (cancelledTask) {
                await NotificationService.sendCancelledNotification(cancelledTask);
            }
        }
    } catch (error) {
        console.error(`Error downloading MP4 for task ${taskId}:`, error);
        
        StorageService.updateTaskState(taskId, {
            status: DownloadStatus.CANCELLED,
            error: `Download failed`,
            downloadResumable: undefined,
        });
        
        const cancelledTask = StorageService.getTask(taskId);
        if (cancelledTask) {
            await NotificationService.sendCancelledNotification(cancelledTask);
        }
    } finally {
        activeDownloadCount--;
        processNextDownload();
    }
};

const startFFmpegDownload = async (taskId: string) => {
    const task = StorageService.getTask(taskId);
    if (!task || task.status !== DownloadStatus.DOWNLOADING || !task.m3u8Url) {
        console.warn(`Task ${taskId} not valid for FFmpeg download.`);
        processNextDownload();
        return;
    }

    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
        console.warn(
            `Cannot start download for task ${taskId}: No internet connection.`
        );
        StorageService.updateTaskState(taskId, {
            status: DownloadStatus.CANCELLED,
            error: "No internet connection available",
        });

        const cancelledTask = StorageService.getTask(taskId);
        if (cancelledTask) {
            await NotificationService.sendCancelledNotification(cancelledTask);
        }

        return;
    }

    activeDownloadCount++;

    await NotificationService.sendStateNotification(task);

    const command = `-i "${task.m3u8Url}" -c copy -bsf:a aac_adtstoasc "${task.filePath}"`;

    try {
        const session = await FFmpegKit.executeAsync(
            command,
            async (session) => {
                const returnCode = await session.getReturnCode();
                const sessionId = session.getSessionId();
                const completedTask = StorageService.getTask(taskId);

                activeDownloadCount--;

                if (!completedTask) {
                    console.error(`Task ${taskId} not found after completion.`);
                    processNextDownload();
                    return;
                }

                if (ReturnCode.isSuccess(returnCode)) {
                    StorageService.updateTaskState(taskId, {
                        status: DownloadStatus.COMPLETED,
                        ffmpegSessionId: undefined,
                    });
                    await NotificationService.sendCompletionNotification(
                        completedTask,
                        true
                    );
                } else if (ReturnCode.isCancel(returnCode)) {
                    StorageService.updateTaskState(taskId, {
                        status: DownloadStatus.CANCELLED,
                        ffmpegSessionId: undefined,
                    });
                    await NotificationService.sendCancelledNotification(
                        completedTask
                    );
                } else {
                    const errorLogs = await session.getLogsAsString();
                    console.error(
                        `FFmpeg task ${taskId} (Session ${sessionId}) failed. Return code: ${returnCode}`
                    );
                    const errorMsg = `FFmpeg failed with code ${returnCode}.`;

                    StorageService.updateTaskState(taskId, {
                        status: DownloadStatus.CANCELLED,
                        error: errorMsg,
                        ffmpegSessionId: undefined,
                    });

                    await NotificationService.sendCancelledNotification(
                        completedTask
                    );
                }
                processNextDownload();
            },
            (log) => {},
            (statistics) => {}
        );

        StorageService.updateTaskState(taskId, {
            ffmpegSessionId: session.getSessionId(),
        });
    } catch (error) {
        activeDownloadCount--;
        console.error(`Error starting FFmpeg task ${taskId}:`, error);

        StorageService.updateTaskState(taskId, {
            status: DownloadStatus.CANCELLED,
            error: "Failed to start FFmpeg process.",
        });

        const cancelledTask = StorageService.getTask(taskId);
        if (cancelledTask) {
            await NotificationService.sendCancelledNotification(cancelledTask);
        }

        processNextDownload();
    }
};

// --- Public API ---

export const findTaskByEpisodeServerId = (
    episodeServerId: string,
    userId?: string
): DownloadTask | null => {
    const tasks = StorageService.getAllTasks();

    if (userId) {
        return (
            tasks.find(
                (task) =>
                    task.episodeData?.episodeServerId === episodeServerId &&
                    task.userId === userId
            ) || null
        );
    }

    return (
        tasks.find(
            (task) => task.episodeData?.episodeServerId === episodeServerId
        ) || null
    );
};

export const initializeDownloadService = async () => {
    if (isInitialized) return;

    await StorageService.ensureDownloadDirExists();
    await StorageService.ensureDownloadJSONData();

    // Mark any interrupted downloads as cancelled
    const interruptedTasks = StorageService.getAllTasks().filter(
        task => task.status === DownloadStatus.DOWNLOADING
    );

    if (interruptedTasks.length > 0) {
        for (const task of interruptedTasks) {
            StorageService.updateTaskState(task.id, {
                status: DownloadStatus.CANCELLED,
                error: "Download cancelled due to app closure",
                ffmpegSessionId: undefined,
                downloadResumable: undefined,
            });
            
            // Clean up any partial files
            try {
                await StorageService.deleteFile(task.filePath);
            } catch (error) {
                console.warn(`Could not delete partial file for ${task.id}:`, error);
            }
        }
    }

    await NotificationService.initializeNotifications();

    netInfoUnsubscribe = NetInfo.addEventListener(handleConnectivityChange);

    const netState = await NetInfo.fetch();
    isConnected = netState.isConnected === true;

    isInitialized = true;
};

// Modified to accept either m3u8Url or mp4Url
export const startDownload = async (
    id: string,
    m3u8Url: string | null,
    mp4Url: string | null,
    title: string,
    userId: string,
    episodeData?: Partial<DownloadTask["episodeData"]>,
    thumbUrl?: string
): Promise<string | null> => {
    if (!isInitialized) {
        console.error("Download service not initialized.");
        return null;
    }

    if (!userId) {
        console.error("Cannot start download: No user ID provided");
        return null;
    }

    // Require at least one URL
    if (!m3u8Url && !mp4Url) {
        console.error("Cannot start download: No valid URL provided");
        return null;
    }

    const taskId = episodeData?.episodeServerId || id;

    let existingTask = StorageService.findTaskByEpisodeServerIdAndUserId(
        episodeData?.episodeServerId || "",
        userId
    );

    if (existingTask) {
        return existingTask.id;
    }

    const filename = StorageService.generateFilename(title);
    const filePath = StorageService.DOWNLOAD_DIR + filename;

    const fileExists = await StorageService.checkFileExists(filePath);
    if (fileExists) {
        const completedTask: DownloadTask = {
            id: taskId,
            m3u8Url: m3u8Url || undefined,
            mp4Url: mp4Url || undefined,
            title,
            thumbUrl,
            filePath,
            status: DownloadStatus.COMPLETED,
            createdAt: Date.now(),
            userId,
            episodeData: {
                movieId: episodeData?.movieId,
                episodeName: episodeData?.episodeName,
                episodeServerId: episodeData?.episodeServerId,
                episodeServerFileName: episodeData?.episodeServerFileName,
                episodeId: id,
                episodeServerName: episodeData?.episodeServerName,
            },
        };
        StorageService.saveTask(completedTask);
        return taskId;
    }

    if (!isConnected) {
        console.error("Cannot start download: No internet connection");
        return null;
    }

    const newTask: DownloadTask = {
        id: taskId,
        m3u8Url: m3u8Url || undefined,
        mp4Url: mp4Url || undefined,
        title,
        thumbUrl,
        filePath,
        status: DownloadStatus.DOWNLOADING,
        createdAt: Date.now(),
        userId,
        episodeData: {
            movieId: episodeData?.movieId,
            episodeName: episodeData?.episodeName,
            episodeServerId: episodeData?.episodeServerId,
            episodeServerFileName: episodeData?.episodeServerFileName,
            episodeServerName: episodeData?.episodeServerName,
        },
    };

    StorageService.saveTask(newTask);
    await NotificationService.sendStateNotification(newTask);
    processNextDownload();

    return taskId;
};

export const cancelDownload = async (taskId: string) => {
    const task = StorageService.getTask(taskId);
    if (!task) return;

    if (task.ffmpegSessionId) {
        await FFmpegKit.cancel(task.ffmpegSessionId);
    } else if (task.downloadResumable) {
        try {
            await task.downloadResumable.pauseAsync();
        } catch (error) {
            console.warn(`Error pausing download for task ${taskId}:`, error);
        }
    }

    StorageService.updateTaskState(taskId, {
        status: DownloadStatus.CANCELLED,
        ffmpegSessionId: undefined,
        downloadResumable: undefined
    });

    const updatedTask = StorageService.getTask(taskId);
    if (updatedTask) {
        await NotificationService.sendCancelledNotification(updatedTask);
    }

    try {
        await StorageService.deleteFile(task.filePath);
    } catch (error) {
        console.warn(`Could not delete partial file for ${taskId}:`, error);
    }
};

export const getDownloadStatus = (taskId: string): DownloadTask | null => {
    return StorageService.getTask(taskId);
};

export const getAllDownloads = (): DownloadTask[] => {
    return StorageService.getAllTasks();
};

export const getAllDownloadsForUser = (userId: string): DownloadTask[] => {
    return StorageService.getTasksByUserId(userId);
};

export const deleteDownloadedFile = async (
    taskId: string
): Promise<boolean> => {
    const task = StorageService.getTask(taskId);
    if (!task) {
        console.error(`Task ${taskId} not found for deletion.`);
        return false;
    }

    try {
        const deleted = await StorageService.deleteFile(task.filePath);
        if (deleted) {
            StorageService.removeTask(taskId);

            await NotificationService.dismissNotification(taskId);
        }
        return deleted;
    } catch (error) {
        console.error(`Failed to delete file for ${taskId}:`, error);
        return false;
    }
};

export const cleanupDownloadService = () => {
    StorageService.getAllTasks().forEach((task) => {
        if (task.status === DownloadStatus.DOWNLOADING) {
            if (task.ffmpegSessionId) {
                FFmpegKit.cancel(task.ffmpegSessionId);
            } else if (task.downloadResumable) {
                try {
                    task.downloadResumable.pauseAsync();
                } catch (error) {
                    console.warn(`Error pausing download for task ${task.id}:`, error);
                }
            }
        }
    });

    if (netInfoUnsubscribe) {
        netInfoUnsubscribe();
        netInfoUnsubscribe = null;
    }

    NotificationService.cleanupNotifications();
    isInitialized = false;
};
