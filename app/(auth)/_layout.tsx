import { useAuth } from "@/providers/auth-context";
import { Stack, useRouter, usePathname } from "expo-router";
import { useEffect } from "react";
import { useLoading } from "@/hooks/use-loading";

export default function AuthLayout() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const { setIsLoading, setMessage } = useLoading();

    // Handle loading state
    useEffect(() => {
        if (authLoading) {
            setIsLoading(true);
            setMessage("Đang kiểm tra trạng thái xác thực...");
        } else {
            setIsLoading(false);
        }
    }, [authLoading]);

    // Handle authentication redirects
    useEffect(() => {
        // Wait until auth is initialized
        if (!authLoading && user) {
            // If user is already signed in, redirect to main app
            // Exception for reset-password route that might be needed for signed-in users
            if (!pathname.includes("reset-password")) {
                router.replace("/(main)/home");
            }
        }
    }, [user, authLoading, router, pathname]);

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
                headerShown: false,
            }}
        >
            {/* Add the index screen */}
            <Stack.Screen
                name="index"
                options={{
                    title: "Koflix",
                    headerShown: false,
                }}
            />
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