import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/providers/auth-context";

export default function TabsLayout() {
    const { user } = useAuth();
    const insets = useSafeAreaInsets();
    
    // Calculate bottom padding based on platform
    const bottomPadding = Platform.OS === 'ios'
        ? insets.bottom
        : insets.bottom + 4;

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: "#121212",
                    borderTopWidth: 0,
                    elevation: 0,
                    height: 60 + bottomPadding,
                    paddingBottom: bottomPadding,
                    position: 'relative',
                },
                tabBarItemStyle: {
                    paddingVertical: 6,
                },
                tabBarActiveTintColor: "#ffffff",
                tabBarInactiveTintColor: "#9ca3af",
                tabBarBackground: undefined,
                lazy: true,
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: "Trang chủ",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="discover"
                options={{
                    title: "Khám phá",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="compass" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="downloaded"
                options={{
                    title: "Tải xuống",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="download" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Hồ sơ",
                    tabBarIcon: ({ color, size }) => (
                        <View style={{ position: 'relative' }}>
                            <Ionicons name="person" size={size} color={color} />
                            {user?.role === 'ADMIN' && (
                                <View
                                    style={{
                                        position: 'absolute',
                                        top: -4,
                                        right: -4,
                                        backgroundColor: '#E50914',
                                        borderRadius: 6,
                                        width: 6,
                                        height: 6,
                                    }}
                                />
                            )}
                        </View>
                    ),
                }}
            />
        </Tabs>
    );
}