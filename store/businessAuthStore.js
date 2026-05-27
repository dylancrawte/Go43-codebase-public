import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useBusinessAuthStore = create((set) => ({
  business: null,
  token: null,
  isLoading: false,

  checkBusinessAuth: async () => {
      try {
        const [token, businessJson] = await Promise.all([
          AsyncStorage.getItem("token"),
          AsyncStorage.getItem("business"),
        ]);
  
        const business = businessJson ? JSON.parse(businessJson) : null;
  
        set({ token, business });
      } catch (error) {
        console.log("Auth check failed", error);
      }
    },

  businessLogout: async () => {
    try {
      await AsyncStorage.multiRemove(["business", "token"]);
    } catch (e) {
      console.warn("Failed to clear storage", e);
    } finally {
      set({ business: null, token: null });
    }
  },

  businessSignUp: async (
    businessName, 
    businessEmail, 
    password,
    businessAddress,
    businessType,
    businessContactName,
    businessContactRole,
    businessContactNumber
  ) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/business/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessName,
          businessEmail,
          password,
          businessAddress,
          businessType,
          businessContactName,
          businessContactRole,
          businessContactNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Something went wrong");
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("business", JSON.stringify(data.result));
      set({ token: data.token, business: data.result });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
    
  businessLogin: async (businessEmail, password) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/business/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ businessEmail, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Something went wrong");

      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("business", JSON.stringify(data.result));

      set({ token: data.token, business: data.result });

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  updateBusinessProfile: async (updates) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/business/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update profile");

      await AsyncStorage.setItem("business", JSON.stringify(data.result));
      set({ business: data.result });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  deleteBusinessAccount: async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/business/account`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete account");

      // Clear local storage and state
      await AsyncStorage.multiRemove(["business", "token"]);
      set({ business: null, token: null });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

}));