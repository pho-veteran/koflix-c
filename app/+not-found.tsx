import { Link, Stack } from "expo-router";
import { StyleSheet } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <VStack className="flex-1 items-center justify-center p-5">
        <Heading className="mb-4" size="xl">This screen doesn't exist</Heading>
        <Text className="mb-8 text-center">The page you're looking for cannot be found</Text>
        
        <Link href="/(auth)/login" asChild>
          <Button className="mt-4">
            <ButtonText>Go to Home</ButtonText>
          </Button>
        </Link>
      </VStack>
    </>
  );
}
