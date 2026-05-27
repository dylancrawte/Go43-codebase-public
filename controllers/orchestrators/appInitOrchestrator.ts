import { useCallback } from "react";
import Constants from "expo-constants";
import { useAuthStore } from "@/store/authStore";
import { useBusinessAuthStore } from "@/store/businessAuthStore";
import * as Notifications from 'expo-notifications';

export const useAppInitOrchestrator = () => {
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const checkBusinessAuth = useBusinessAuthStore((s) => s.checkBusinessAuth);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const business = useBusinessAuthStore((s) => s.business);
  const refreshTikTokData = useAuthStore((s) => s.refreshTikTokData);

  // Check both user and business auth in parallel
  const checkAllAuth = useCallback(async () => {
    await Promise.all([checkAuth(), checkBusinessAuth()]);
  }, [checkAuth, checkBusinessAuth]);

  // Determine initial route based on auth state
  const determineInitialRoute = useCallback(() => {
    if (business) {
      return "/businessHomepage";
    } else {
      return isAuthenticated ? "/(fan)/explore" : "/";
    }
  }, [business, isAuthenticated]);

  // Setup TikTok token refresh scheduling
  const setupTikTokRefresh = useCallback(() => {
    if (!user?.tiktokId || !user?.tiktokTokenExpiry) {
      return () => {}; // No-op cleanup
    }

    const expiryMs = new Date(user.tiktokTokenExpiry).getTime();
    if (Number.isNaN(expiryMs)) {
      return () => {}; // No-op cleanup
    }

    const THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24h
    const now = Date.now();
    const msUntilRefresh = expiryMs - THRESHOLD_MS - now;

    let timer: ReturnType<typeof setTimeout> | undefined;

    if (msUntilRefresh <= 0) {
      // Already within threshold → refresh now (once)
      (async () => {
        await refreshTikTokData();
      })();
    } else {
      // Not yet within threshold → schedule it
      timer = setTimeout(async () => {
        await refreshTikTokData();
      }, msUntilRefresh);
    }

    // Return cleanup function
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [user?.tiktokId, user?.tiktokTokenExpiry, refreshTikTokData]);

  async function registerForPushNotificationsAsync() {
    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        return;
      }

      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
      if (!projectId) {
        return;
      }

      await Notifications.getExpoPushTokenAsync({ projectId });
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  }

  return {
    checkAllAuth,
    determineInitialRoute,
    setupTikTokRefresh,
    user,
    business,
    isAuthenticated,
    registerForPushNotificationsAsync,
  };
};
