import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { useEffect, useState, useRef } from "react";
import { router, Stack, usePathname, useSegments } from "expo-router";
import { useFonts } from "expo-font";
import { SplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ToastProvider } from "@/components/CustomToast";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAppInitOrchestrator } from "@/controllers/orchestrators/appInitOrchestrator";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Aileron: require("../assets/fonts/Aileron-Regular.otf"),
    AileronBold: require("../assets/fonts/Aileron-Bold.otf"),
    AileronThin: require("../assets/fonts/Aileron-Thin.otf"),
  });

  const [authChecked, setAuthChecked] = useState(false);
  const {
    checkAllAuth,
    determineInitialRoute,
    setupTikTokRefresh,
  } = useAppInitOrchestrator();

  const didCheckRef = useRef(false);
  const didRedirectRef = useRef(false);
  
  // Track route changes for debugging
  const pathname = usePathname();
  const segments = useSegments();
  
  useEffect(() => {
    console.log("🔴 [Route Change] Pathname:", pathname, "Segments:", segments);
    if (pathname === '/+not-found') {
      console.log("⚠️ [Route Change] NOT-FOUND screen shown!");
      console.trace("Stack trace for not-found navigation");
    }
  }, [pathname, segments]);

  // Check auth on mount
  useEffect(() => {
    if (didCheckRef.current) return;
    didCheckRef.current = true;
    (async () => {
      await checkAllAuth();
      setAuthChecked(true);
    })();
  }, [checkAllAuth]); 

  // Redirect after auth is checked
  useEffect(() => {
    if (didRedirectRef.current) return;
    if (!authChecked) return;
    didRedirectRef.current = true;
    const route = determineInitialRoute();
    router.replace(route);
  }, [authChecked, determineInitialRoute]);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]); 

  // Auto-refresh TikTok data when tokens are expired or about to expire
  useEffect(() => {
    return setupTikTokRefresh();
  }, [setupTikTokRefresh]);

  // useEffect(() => {
  //   async function checkForUpdates() {
  //     try {
  //       const update = await Updates.checkForUpdateAsync();
  //       if (update.isAvailable) {
  //         await Updates.fetchUpdateAsync();
  //         await Updates.reloadAsync();
  //       }
  //     } catch (error) {
  //       console.log('Error checking for updates:', error);
  //     }
  //   }

  //   if (!__DEV__) {
  //     checkForUpdates();
  //   }
  // }, []);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
    <ToastProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }} />
      </GestureHandlerRootView>
    </ToastProvider>
    </SafeAreaProvider>
  );
};
