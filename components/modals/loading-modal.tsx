import React from "react";
import { ActivityIndicator, View } from "react-native";
import { Text } from "../ui/text";
import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogContent } from "../ui/alert-dialog";
import { useLoading } from "@/hooks/use-loading";

const LoadingModal = () => {
    const { isLoading, message } = useLoading();

    return (
        <AlertDialog isOpen={isLoading}>
            <AlertDialogBackdrop />
            <AlertDialogContent className="p-6 flex flex-col items-center min-w-[180px]">
                <AlertDialogBody>
                    <View className="flex flex-col items-center">
                        <ActivityIndicator size="large" color="#3B82F6" />
                        <Text className="mt-4 text-typography-500">
                            {message || "Loading..."}
                        </Text>
                    </View>
                </AlertDialogBody>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default LoadingModal;