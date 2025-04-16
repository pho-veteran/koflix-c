import React from "react";
import { ActivityIndicator, View } from "react-native";
import { Text } from "../ui/text";
import { AlertDialog, AlertDialogBackdrop, AlertDialogContent } from "../ui/alert-dialog"; // Removed AlertDialogBody as we'll structure content directly
import { useLoading } from "@/hooks/use-loading";
import { BlurView } from 'expo-blur'; // Import BlurView

const LoadingModal = () => {
    const { isLoading, message } = useLoading();

    // Don't render anything if not loading
    if (!isLoading) {
        return null;
    }

    return (
        // Use AlertDialog to handle modal state and backdrop
        <AlertDialog isOpen={isLoading} isKeyboardDismissable={false}>
            {/* Semi-transparent backdrop */}
            <AlertDialogBackdrop className="bg-black/60" />

            {/* Content container - make it transparent to let BlurView show through */}
            <AlertDialogContent className="bg-transparent border-0 shadow-none items-center justify-center p-0">
                {/* Use BlurView for the background effect */}
                <BlurView
                    intensity={20} // Adjust intensity for desired blur level
                    tint="dark"    // 'light', 'dark', 'default'
                    className="rounded-2xl overflow-hidden"
                >
                    {/* Inner container for padding and content */}
                    <View className="px-8 py-6 items-center justify-center bg-black/40">
                        <ActivityIndicator size="large" color="#FFFFFF" />
                        <Text className="mt-4 text-white/80 text-base text-center">
                            {message || "Đang tải..."}
                        </Text>
                    </View>
                </BlurView>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default LoadingModal;