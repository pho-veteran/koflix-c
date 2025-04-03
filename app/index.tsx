import { useAuth } from "@/lib/auth-context";
import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
    const { user, isLoading } = useAuth();
    
    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
                <ActivityIndicator size="large" color="#E50914" />
            </View>
        );
    }

    // Simply redirect based on authentication status
    return user ? <Redirect href="/(main)/home" /> : <Redirect href="/(auth)/login" />;
}