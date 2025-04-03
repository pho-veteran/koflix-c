import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";

export default function Index() {
    const [isLoading, setIsLoading] = useState(true);
    
    // Add a small delay to simulate app initialization
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        
        return () => clearTimeout(timer);
    }, []);
    
    // Show a loading state briefly before redirecting
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
                <ActivityIndicator size="large" color="#E50914" />
            </View>
        );
    }

    // Always redirect to login page
    return <Redirect href="/(auth)/login" />;
}