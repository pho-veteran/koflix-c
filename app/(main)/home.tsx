import { Box } from "@/components/ui/box";
import { Text, View, StyleSheet, Alert, Image } from "react-native";
import { signOut, getCurrentUser } from "@/lib/firebase-auth";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { Button, ButtonText, ButtonSpinner } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export default function Index() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();
    const [userDetails, setUserDetails] = useState({
        displayName: '',
        email: '',
        photoURL: '',
        uid: ''
    });

    useEffect(() => {
        // Get user details when component mounts
        const currentUser = getCurrentUser();
        if (currentUser) {
            setUserDetails({
                displayName: currentUser.displayName || 'Koflix User',
                email: currentUser.email || 'No email provided',
                photoURL: currentUser.photoURL || '',
                uid: currentUser.uid || ''
            });
        }
    }, [user]);

    const handleSignOut = async () => {
        setIsLoading(true);
        try {
            await signOut();
            // The auth context should automatically redirect to login
            router.replace("/(auth)/login");
        } catch (error: any) {
            Alert.alert(
                "Đăng xuất thất bại",
                error.message || "Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-[#121212] p-6">
            {/* User Profile Card */}
            <Box className="w-full bg-[#1E1E1E] rounded-xl p-6 mb-8 shadow-lg">
                <View className="flex-row items-center mb-4">
                    {userDetails.photoURL ? (
                        <Image 
                            source={{ uri: userDetails.photoURL }} 
                            className="w-16 h-16 rounded-full mr-4"
                        />
                    ) : (
                        <View className="w-16 h-16 rounded-full bg-primary-700 mr-4 items-center justify-center">
                            <Text className="text-white text-2xl font-bold">
                                {userDetails.displayName?.charAt(0) || userDetails.email?.charAt(0) || 'K'}
                            </Text>
                        </View>
                    )}
                    
                    <View className="flex-1">
                        <Text className="text-white text-xl font-bold">{userDetails.displayName}</Text>
                        <Text className="text-gray-400">{userDetails.email}</Text>
                    </View>
                </View>
                
                <View className="bg-[#2A2A2A] p-4 rounded-lg">
                    <Text className="text-white font-semibold mb-1">Account ID</Text>
                    <Text className="text-gray-400 text-xs">{userDetails.uid}</Text>
                </View>
            </Box>

            {/* Welcome Message */}
            <Box className="bg-primary-500 p-5 rounded-lg mb-8">
                <Text className="text-typography-0 text-xl font-bold mb-2 text-center">Welcome to Koflix!</Text>
                <Text className="text-typography-0 text-base text-center">You are now logged in.</Text>
            </Box>

            {/* Sign Out Button */}
            <Button
                variant="solid"
                size="lg"
                action="negative"
                onPress={handleSignOut}
                isDisabled={isLoading}
                className="w-full"
            >
                {isLoading ? (
                    <ButtonSpinner color="white" />
                ) : (
                    <ButtonText>Đăng xuất</ButtonText>
                )}
            </Button>
        </View>
    );
}