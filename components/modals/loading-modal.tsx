import React from "react";
import { ActivityIndicator, View } from "react-native";
import { Text } from "../ui/text";
import { AlertDialog, AlertDialogBackdrop, AlertDialogContent } from "../ui/alert-dialog";
import { useLoading } from "@/hooks/use-loading";
import { BlurView } from 'expo-blur';
import { NETFLIX_RED } from "@/constants/ui-constants";

const LoadingModal = () => {
    const { isLoading, message } = useLoading();

    if (!isLoading) {
        return null;
    }

    return (
        <AlertDialog isOpen={isLoading} isKeyboardDismissable={false}>
            {/* Semi-transparent backdrop */}
            <AlertDialogBackdrop className="bg-black/60" />

            {/* Content container - make it transparent to let BlurView show through */}
            <AlertDialogContent className="bg-transparent border-0 shadow-none items-center justify-center p-0">
                {/* Use BlurView for the background effect */}
                <BlurView
                    intensity={20}
                    tint="dark"
                    className="rounded-2xl overflow-hidden"
                >
                    {/* Inner container for padding and content */}
                    <View className="px-8 py-6 items-center justify-center bg-black/40">
                        <ActivityIndicator size="large" color={NETFLIX_RED} />
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