import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { DownloadStatus, DownloadTask } from "@/types/download-type";

export const NOTIFICATION_CHANNEL_ID = "download_channel";
let isInitialized = false;

/**
 * Configure notification permissions and channels
 */
export const initializeNotifications = async (): Promise<boolean> => {
    if (isInitialized) return true;

    try {
        // Request permissions
        const { status } = await Notifications.requestPermissionsAsync({
            ios: {
                allowAlert: true,
                allowBadge: true,
                allowSound: true,
            },
        });

        if (status !== "granted") {
            console.warn("Notification permissions not granted");
            return false;
        }

        // Set up notification categories/actions for iOS
        await Notifications.setNotificationCategoryAsync("download", [
            {
                identifier: "cancel",
                buttonTitle: "Hủy tải xuống",
                options: {
                    isDestructive: true,
                },
            },
            {
                identifier: "view",
                buttonTitle: "Xem",
            },
        ]);

        // Set up notification channel for Android
        if (Platform.OS === "android") {
            await Notifications.setNotificationChannelAsync(
                NOTIFICATION_CHANNEL_ID,
                {
                    name: "Thông báo tải xuống",
                    description: "Thông báo về tình trạng tải xuống",
                    importance: Notifications.AndroidImportance.HIGH,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: "#FF231F7C",
                    enableVibrate: false,
                    showBadge: true,
                }
            );
        }

        isInitialized = true;
        return true;
    } catch (error) {
        console.error("Error configuring notifications:", error);
        return false;
    }
};

/**
 * Send a notification for a download state change
 */
export const sendStateNotification = async (
    task: DownloadTask
): Promise<boolean> => {
    if (!isInitialized) {
        console.warn("Notification service not initialized");
        return false;
    }

    try {
        const { status } = await Notifications.getPermissionsAsync();

        if (status !== "granted") {
            console.log(
                `Skipping notification for task ${task.id} - no permissions`
            );
            return false;
        }

        const notificationId = `download_state_${task.id}`;

        if (task.status !== DownloadStatus.DOWNLOADING) {
            return false;
        }

        await Notifications.scheduleNotificationAsync({
            identifier: notificationId,
            content: {
                title: `${task.title}`,
                body: "Đang tải xuống...",
                data: { taskId: task.id, type: "state", status: task.status },
                sound: false,
                priority: Notifications.AndroidNotificationPriority.LOW,
                ...(Platform.OS === "android" && {
                    channelId: NOTIFICATION_CHANNEL_ID,
                    sticky: false,
                }),
            },
            trigger: null,
        });

        return true;
    } catch (error) {
        console.error(
            `Error sending state notification for task ${task.id}:`,
            error
        );
        return false;
    }
};

/**
 * Send a notification for a completed download (success or failure)
 */
export const sendCompletionNotification = async (
    task: DownloadTask,
    success: boolean
): Promise<boolean> => {
    if (!isInitialized) {
        return false;
    }

    try {
        const notificationId = `download_complete_${task.id}`;

        try {
            await Notifications.dismissNotificationAsync(
                `download_state_${task.id}`
            );
        } catch (err) {}

        const unknownErrorMsg = "Đã xảy ra lỗi không xác định.";

        await Notifications.scheduleNotificationAsync({
            identifier: notificationId,
            content: {
                title: success
                    ? `Tải xuống hoàn tất: ${task.title}`
                    : `Tải xuống thất bại: ${task.title}`,
                body: success ? "Nhấn để xem." : task.error || unknownErrorMsg,
                data: {
                    taskId: task.id,
                    filePath: task.filePath,
                    type: "completion",
                    success,
                },
                sound: true,
                priority: Notifications.AndroidNotificationPriority.HIGH,
                ...(Platform.OS === "android" && {
                    channelId: NOTIFICATION_CHANNEL_ID,
                }),
            },
            trigger: null,
        });

        return true;
    } catch (error) {
        console.error(
            `Error sending completion notification for task ${task.id}:`,
            error
        );
        return false;
    }
};

/**
 * Send a notification for a cancelled download
 */
export const sendCancelledNotification = async (
    task: DownloadTask
): Promise<boolean> => {
    if (!isInitialized) {
        console.warn("Notification service not initialized");
        return false;
    }

    try {
        try {
            await Notifications.dismissNotificationAsync(
                `download_state_${task.id}`
            );
        } catch (err) {}

        const notificationId = `download_cancelled_${task.id}`;

        await Notifications.scheduleNotificationAsync({
            identifier: notificationId,
            content: {
                title: `Đã hủy tải xuống: ${task.title}`,
                body: "Tải xuống đã bị hủy.",
                data: {
                    taskId: task.id,
                    type: "cancelled",
                },
                sound: false,
                priority: Notifications.AndroidNotificationPriority.LOW,
                ...(Platform.OS === "android" && {
                    channelId: NOTIFICATION_CHANNEL_ID,
                }),
            },
            trigger: null,
        });

        return true;
    } catch (error) {
        console.error(
            `Error sending cancelled notification for task ${task.id}:`,
            error
        );
        return false;
    }
};

/**
 * Dismiss a notification for a specific task
 */
export const dismissNotification = async (taskId: string): Promise<boolean> => {
    try {
        const notificationTypes = ["state", "complete", "cancelled"];

        for (const type of notificationTypes) {
            try {
                await Notifications.dismissNotificationAsync(
                    `download_${type}_${taskId}`
                );
            } catch (err) {}
        }

        return true;
    } catch (error) {
        console.error(
            `Error dismissing notifications for task ${taskId}:`,
            error
        );
        return false;
    }
};

/**
 * Clean up notification resources
 */
export const cleanupNotifications = (): void => {
    isInitialized = false;
};
