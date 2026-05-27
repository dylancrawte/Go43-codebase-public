import { Stack } from "expo-router";

export default function BusinessLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="businessHomepage" />
      <Stack.Screen name="campaign/[id]" />
      <Stack.Screen name="createCampaign" />
      <Stack.Screen name="businessProfile" />
    </Stack>
  );
}