import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";

/**
 * TikTok OAuth callback handler
 * This route catches deep links from the backend redirect
 * and immediately redirects to /loading where the SDK callback will handle the actual logic
 */
export default function TikTokCallbackScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/loading");
  }, [router]);
  
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FF66C4" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
});

