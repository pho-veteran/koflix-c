import { Stack } from 'expo-router';

export default function SearchLayout() {
  
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: '#000',
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Lịch sử xem",
        }}
      />
    </Stack>
  );
}