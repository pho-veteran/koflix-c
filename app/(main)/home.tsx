import { Box } from "@/components/ui/box";
import { Text, View, Alert, Image } from "react-native";
import { signOut } from "@/lib/firebase-auth";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Button, ButtonText, ButtonSpinner } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-context";

export default function Index() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { user, firebaseUser, refreshUserData } = useAuth();

    const handleSignOut = async () => {
        setIsLoading(true);
        try {
            await signOut();
            router.replace("/(auth)");
        } catch (error: any) {
            Alert.alert(
                "Đăng xuất thất bại",
                error.message || "Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = () => {
        refreshUserData();
    };

    // Get profile picture - prefer backend user data first, fallback to Firebase auth
    const getProfilePicture = () => {
        if (user?.avatarUrl) return user.avatarUrl;
        if (firebaseUser?.photoURL) return firebaseUser.photoURL;
        return null;
    };

    // Get initial for avatar fallback
    const getInitial = () => {
        if (user?.name) return user.name.charAt(0);
        if (firebaseUser?.displayName) return firebaseUser.displayName.charAt(0);
        return 'K';
    };

    return (
        <View className="flex-1 bg-[#121212] p-6">
            {/* User Profile Card */}
            <Box className="w-full bg-[#1E1E1E] rounded-xl p-6 mb-8 shadow-lg">
                <View className="flex-row items-center mb-4">
                    {getProfilePicture() ? (
                        <Image 
                            source={{ uri: getProfilePicture() as string }} 
                            className="w-16 h-16 rounded-full mr-4"
                        />
                    ) : (
                        <View className="w-16 h-16 rounded-full bg-primary-700 mr-4 items-center justify-center">
                            <Text className="text-white text-2xl font-bold">
                                {getInitial()}
                            </Text>
                        </View>
                    )}
                    
                    <View className="flex-1">
                        <Text className="text-white text-xl font-bold">
                            {user?.name || firebaseUser?.displayName || 'Koflix User'}
                        </Text>
                        <Text className="text-gray-400">
                            {user?.emailOrPhone || firebaseUser?.email || firebaseUser?.phoneNumber || 'No contact info'}
                        </Text>
                    </View>
                </View>
                
                <View className="bg-[#2A2A2A] p-4 rounded-lg">
                    <Text className="text-white font-semibold mb-1">Account Info</Text>
                    <Text className="text-gray-400 text-xs">ID: {user?.id || firebaseUser?.uid || 'Unknown'}</Text>
                    {user?.role && (
                        <Text className="text-gray-400 text-xs mt-1">Role: {user.role}</Text>
                    )}
                    {user?.createdAt && (
                        <Text className="text-gray-400 text-xs mt-1">
                            Member since: {new Date(user.createdAt).toLocaleDateString()}
                        </Text>
                    )}
                </View>
            </Box>

            {/* Welcome Message */}
            <Box className="bg-primary-500 p-5 rounded-lg mb-8">
                <Text className="text-typography-0 text-xl font-bold mb-2 text-center">
                    Welcome to Koflix!
                </Text>
                <Text className="text-typography-0 text-base text-center">
                    {user ? `Enjoy your ${user.role.toLowerCase()} experience.` : 'You are now logged in.'}
                </Text>
            </Box>

            {/* Refresh Button */}
            <Button
                variant="outline"
                size="lg"
                onPress={handleRefresh}
                className="w-full mb-4"
            >
                <ButtonText>Refresh User Data</ButtonText>
            </Button>

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