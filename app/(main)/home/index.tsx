import { Box } from "@/components/ui/box";
import { Text, View } from "react-native";

export default function Index() {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Box className="bg-primary-500 p-5">
                <Text className="text-typography-0">Welcome to Koflix!</Text>
                <Text className="text-typography-0">Please log in to continue.</Text>
            </Box>
        </View>
    );
}