import { useAuth } from "@/lib/auth-context";
import { Stack } from "expo-router";
import { View, ActivityIndicator } from "react-native";

export default function AuthLayout() {
    const { isLoading } = useAuth();

    // Show loading indicator while checking auth state
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
                <ActivityIndicator size="large" color="#E50914" />
            </View>
        );
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
                name="login"
                options={{
                    title: "Đăng nhập",
                }}
            />
            <Stack.Screen
                name="signup"
                options={{
                    title: "Đăng ký",
                }}
            />
            <Stack.Screen
                name="forgot-password"
                options={{
                    title: "Quên mật khẩu",
                }}
            />
            <Stack.Screen
                name="verify-code"
                options={{
                    title: "Xác thực OTP",
                }}
            />
            <Stack.Screen
                name="reset-password"
                options={{
                    title: "Đặt lại mật khẩu",
                }}
            />
        </Stack>
    );
}