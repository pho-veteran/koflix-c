import { useAuth } from "@/providers/auth-context";
import { Stack, useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useEffect } from "react";

export default function MainLayout() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    // Handle authentication redirects
    useEffect(() => {
        // Wait until auth is initialized
        if (!authLoading && !user) {
            // If user is not signed in, redirect to auth
            router.replace("/(auth)");
        }
    }, [user, authLoading, router]);

    // Show loading indicator while checking auth state
    if (authLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
                <ActivityIndicator size="large" color="#E50914" />
            </View>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: "#121212",
                },
                headerTintColor: "#fff",
                headerTitleStyle: {
                    fontWeight: "bold",
                },
            }}
        >
            <Stack.Screen
                name="home"
                options={{
                    title: "Trang chủ",
                }}
            />
            {/* Add other main screens here */}
        </Stack>
    );
}