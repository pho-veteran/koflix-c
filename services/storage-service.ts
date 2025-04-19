import { DownloadStatus, DownloadTask } from "@/types/download-type";
import * as FileSystem from "expo-file-system";

export const DOWNLOAD_DIR = FileSystem.documentDirectory + "downloads/";
const DOWNLOAD_DATA_FILE = FileSystem.documentDirectory + "download-data.json";

let downloadQueue: { [id: string]: DownloadTask } = {};
let dataLoaded = false;

type Listener = () => void;
const changeListeners: Listener[] = [];

/**
 * Subscribes a listener function to be called whenever download data changes.
 * @param listener The function to call on data change.
 * @returns An unsubscribe function.
 */
export const subscribeToDownloadDataChanges = (
    listener: Listener
): (() => void) => {
    changeListeners.push(listener);
    return () => {
        const index = changeListeners.indexOf(listener);
        if (index > -1) {
            changeListeners.splice(index, 1);
        }
    };
};

/** Emits a change event to all subscribed listeners. */
const emitDownloadDataChange = () => {
    setTimeout(() => {
        changeListeners.forEach((listener) => listener());
    }, 0);
};

export const generateFilename = (title: string): string => {
    return title.replace(/[^a-zA-Z0-9-_.]/g, "_") + ".mp4";
};

export const updateTaskState = (
    taskId: string,
    updates: Partial<DownloadTask>
) => {
    if (downloadQueue[taskId]) {
        downloadQueue[taskId] = { ...downloadQueue[taskId], ...updates };
        saveDownloadData();
    }
};

export const ensureDownloadDirExists = async (): Promise<void> => {
    const dirInfo = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(DOWNLOAD_DIR, {
            intermediates: true,
        });
    }
};

export const ensureDownloadJSONData = async (): Promise<void> => {
    if (dataLoaded) return;

    try {
        const fileInfo = await FileSystem.getInfoAsync(DOWNLOAD_DATA_FILE);

        if (fileInfo.exists) {
            const jsonData = await FileSystem.readAsStringAsync(
                DOWNLOAD_DATA_FILE
            );
            const storedTasks = JSON.parse(jsonData);

            for (const [taskId, task] of Object.entries(storedTasks)) {
                const downloadTask = task as DownloadTask;

                if (downloadTask.status === "completed") {
                    const fileExists = await checkFileExists(
                        downloadTask.filePath
                    );
                    if (!fileExists) {
                        downloadTask.status = DownloadStatus.CANCELLED;
                        downloadTask.error = "File no longer exists";
                    }
                }

                downloadQueue[taskId] = downloadTask;
            }
        } else {
            await saveDownloadData();
        }

        dataLoaded = true;
    } catch (error) {
        console.error("Error loading download data:", error);
        await saveDownloadData();
        dataLoaded = true;
    }
};

const saveDownloadData = async (): Promise<void> => {
    try {
        const jsonData = JSON.stringify(downloadQueue);
        await FileSystem.writeAsStringAsync(DOWNLOAD_DATA_FILE, jsonData);
        emitDownloadDataChange();
    } catch (error) {
        console.error("Error saving download data:", error);
    }
};

// Public API
export const saveTask = (task: DownloadTask): void => {
    downloadQueue[task.id] = task;
    saveDownloadData();
};

export const getTask = (taskId: string): DownloadTask | null => {
    return downloadQueue[taskId] || null;
};

export const getAllTasks = (): DownloadTask[] => {
    return Object.values(downloadQueue);
};

export const removeTask = (taskId: string): void => {
    if (downloadQueue[taskId]) {
        delete downloadQueue[taskId];
        saveDownloadData();
    }
};

export const checkFileExists = async (filePath: string): Promise<boolean> => {
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    return fileInfo.exists;
};

export const deleteFile = async (filePath: string): Promise<boolean> => {
    try {
        await FileSystem.deleteAsync(filePath, { idempotent: true });
        return true;
    } catch (error) {
        console.error(`Failed to delete file: ${filePath}`, error);
        return false;
    }
};

export const clearAllTasks = (): void => {
    downloadQueue = {};
    saveDownloadData();
};

// Add these functions to filter tasks by userId
export const getTasksByUserId = (userId: string): DownloadTask[] => {
    return Object.values(downloadQueue).filter(task => task.userId === userId);
};

export const findTaskByEpisodeServerIdAndUserId = (
    episodeServerId: string,
    userId: string
): DownloadTask | null => {
    return Object.values(downloadQueue).find(
        task => task.episodeData?.episodeServerId === episodeServerId && task.userId === userId
    ) || null;
};

// Update existing functions to support userId filtering
export const checkTaskExists = (taskId: string, userId: string): boolean => {
    const task = downloadQueue[taskId];
    return task ? task.userId === userId : false;
};
