import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CryptoService } from "../utility/crypto";
import { User } from "../app/types";

export const useAuthStore = create<{
  user: User | null,
  token: string | null,
  isLoading: boolean,
  isAuthenticated: boolean,
  instagramProfile: any,
  genre: any,
  setInstagramProfile: (profile: any) => void,
  setGenre: (genre: any) => void,
  register: (
    firstName: string,
    lastName: string,
    username: string,
    email: string,
    password: string,
    phoneNumber?: string,
    genres?: string[],
    tiktokLink?: string,
  ) => Promise<{ success: boolean; error?: string }>,
  checkAuth: () => Promise<boolean | undefined>,
  logout: () => Promise<void>,
  deleteAccount: () => Promise<{ success: boolean; error?: string }>,
  codeVerifier: () => Promise<{ code_verifier: string; csrfState: string }>,
  retrieveStoredCodeVerifier: () => Promise<{ code_verifier: string | null; storedCsrfState: string | null }>,
  saveUpdatedUser: (updatedUser: User) => Promise<void>,
  storeTikTokToken: (token: string, user: User, tiktokTokenExpiry: string) => Promise<void>,
  refreshTikTokData: () => Promise<{ success: boolean; user?: User; message?: string }>,
  login: (email: string, password: string) => Promise<void>,
}>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  instagramProfile: null,
  setInstagramProfile: (profile) => set({ instagramProfile: profile }),
  genre: null,
  setGenre: (genre) => set({ genre }),

  checkAuth: async () => {
    try {
      // retrieve stored auth data
      const [token, userJson, tiktokTokenExpiry] = await Promise.all([
        AsyncStorage.getItem("token"),
        AsyncStorage.getItem("user"),
        AsyncStorage.getItem("tiktokTokenExpiry")
      ]);

      let user = null;
      let isAuthenticated = false;

      if (userJson) {
        try {
          //validate user data
          user = JSON.parse(userJson);
          if (!user._id) {
            throw new Error("Essential user data missing");
          }
        } catch (parseError) { // cleans up bad data
          console.warn("User data corrupted", parseError);
          await AsyncStorage.removeItem("user");
          user = null;
        }
      }    

      // validate token
      if (token && user) {
        if (tiktokTokenExpiry) {
          const now = Date.now();
          const expiry = Number(tiktokTokenExpiry);
          if (!isNaN(expiry) && now > expiry) {
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("tiktokTokenExpiry"); 
            isAuthenticated = false;
          } else {
            isAuthenticated = true;
          }
        } else {
          isAuthenticated = true;
        } 
      } else {
        isAuthenticated = false;
      }

      //updates store state
      set({ token: isAuthenticated ? token : null, user: isAuthenticated ? user : null, isAuthenticated });
    } catch (error) {
      console.error("Auth check failed", error);
      set({ token: null, user: null, isAuthenticated: false });
      return false;
    }
  },

  register: async (
    firstName: string,
    lastName: string,
    username: string,
    email: string,
    password: string,
    phoneNumber?: string,
    genres?: string[],
    tiktokLink?: string,
    //dateOfBirth,
  ) => {
    set({ isLoading: true });

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName,
            lastName,
            username,
            email,
            password,
            phoneNumber,
            genres,
            tiktokLink,
          }),
        }
      );

      // Check if response is JSON before parsing
      const contentType = response.headers.get("content-type");
      
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors with specific field messages
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map((err: any) => `${err.field}: ${err.message}`).join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(data.message || "Registration failed");
      }

      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      await AsyncStorage.setItem("token", data.token);

      set({ token: data.token, user: data.user, isLoading: false });

      return {
        success: true,
      };
    } catch (error) {
      set({ isLoading: false });
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          return { success: false, error: "Unable to connect to server. Please check your internet connection." };
        }
        if (error.message.includes('Server error')) {
          return { success: false, error: "Server is temporarily unavailable. Please try again later." };
        }
        return { success: false, error: error.message };
      }
      
      return { success: false, error: "An unexpected error occurred. Please try again." };
    }
  },

  //currently not using this login route
  login: async (email: string, password: string) => {
    try {
      const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/auth/login`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ loginField: email, password })
      });

      // Check if response is JSON before parsing
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Login failed");
      }

      const data = await response.json();
      
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.result));
      set({ user: data.result, token: data.token, isAuthenticated: true });
      
    } catch (error) {
      console.error("Login error:", error);

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          throw new Error("Unable to connect to server. Please check your internet connection.");
        }
        if (error.message.includes('Server error')) {
          throw new Error("Server is temporarily unavailable. Please try again later.");
        }
        throw error;
      }
      
      throw new Error("An unexpected error occurred. Please try again.");
    }
  },

  logout: async () => {
    set({ user: null, token: null, instagramProfile: null, isAuthenticated: false });
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("instagramProfile");
    await AsyncStorage.removeItem("tiktokTokenExpiry");
  },

  deleteAccount: async () => {
    const { user, token } = get();
    
    if (!user?._id || !token) {
      return { success: false, error: "No user or token found" };
    }

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${user._id}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete account");
      }

      // Clear local storage and state
      set({ user: null, token: null, instagramProfile: null, isAuthenticated: false });
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("instagramProfile");
      await AsyncStorage.removeItem("tiktokTokenExpiry");

      return { success: true };
    } catch (error) {
      console.error("Error deleting account:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to delete account" 
      };
    }
  },

  codeVerifier: async () => {
    const code_verifier = await CryptoService.generateRandomString(64);
    const csrfState = await CryptoService.generateRandomString(64);
    AsyncStorage.setItem("tiktok_code_verifier", code_verifier);
    AsyncStorage.setItem("tiktok_csrf_state", csrfState);

    return { code_verifier, csrfState };
  },

  retrieveStoredCodeVerifier: async () => {
    const [code_verifier, storedCsrfState] = await Promise.all([
      AsyncStorage.getItem("tiktok_code_verifier"),
      AsyncStorage.getItem("tiktok_csrf_state")
    ]);
    return { code_verifier, storedCsrfState };
  },

  storeTikTokToken: async (token, user, tiktokTokenExpiry) => {
    await Promise.all([
      AsyncStorage.setItem("token", token),
      AsyncStorage.setItem("user", JSON.stringify(user)),
      AsyncStorage.setItem("tiktokTokenExpiry", tiktokTokenExpiry),
    ]);
  },

  saveUpdatedUser: async (updatedUser: any) => {
    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  refreshTikTokData: async () => {
    try {
      const { LoginServices } = await import("@/controllers/services/loginServices");
      const response = await LoginServices.refreshTikTokTokens();
      
      if (response.data.user) {
        // Update stored user data with fresh avatar URL and tokens
        await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
        await AsyncStorage.setItem("token", response.data.token);
        
        if (response.data.tiktokTokenExpiry) {
          await AsyncStorage.setItem("tiktokTokenExpiry", response.data.tiktokTokenExpiry);
        }
        
        set({ user: response.data.user });
        
        return { success: true, user: response.data.user };
      }
      
      return { success: false, message: "No user data received" };
    } catch (error) {
      console.error("Failed to refresh TikTok data:", error);
      return { success: false, message: "Failed to refresh TikTok data" };
    }
  }

}));