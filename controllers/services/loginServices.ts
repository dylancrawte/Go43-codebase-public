import { router } from "expo-router";
import { loginAPIs } from "../api/loginAPI";
import { useAuthStore } from "@/store/authStore";
import { authorize, Scopes } from 'react-native-tiktok';

export class LoginServices {

    static async authorizeTikTok() {
        const redirectURI = process.env.EXPO_PUBLIC_REDIRECT_URI;
        if (!redirectURI) {
            throw new Error("EXPO_PUBLIC_REDIRECT_URI is not configured");
        }
        authorize({
            redirectURI: redirectURI,
            scopes: [Scopes.user.info.basic, Scopes.video.list],
            callback: async (authCode, codeVerifier) => {
              if (authCode && codeVerifier) {
                try {
                  router.replace('/loading');
                  const res = await loginAPIs.exchangeEndpoint(authCode, codeVerifier);
                  if (res.status === 200) {
                    const { storeTikTokToken } = useAuthStore.getState();
                    await storeTikTokToken(
                      res.data.token,
                      res.data.user,
                      res.data.tiktokTokenExpiry,
                    );

                    useAuthStore.setState({
                      user: res.data.user,
                      token: res.data.token,
                      isAuthenticated: true,
                    });

                    router.replace('/(fan)/explore');
                  } else {
                    router.replace('/');
                  }
                } catch (error) {
                  console.error("TikTok auth exchange failed:", error);
                  router.replace('/');
                }
              }
            }
          });
        }

    static async refreshTikTokTokens() {
        try {
            const response = await loginAPIs.refreshTokens();
            return response;
        } catch (error) {
            console.error("Error refreshing TikTok tokens:", error);
            throw error;
        }
    }
}
