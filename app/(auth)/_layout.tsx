import { Stack } from "expo-router";

export default function AuthLayout() {
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
        </Stack>
    );
}