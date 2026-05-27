import { useAuthStore } from "@/store/authStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { LoginServices } from "../services/loginServices";
import { useBusinessAuthStore } from "@/store/businessAuthStore";
import { Alert } from "react-native";

export const useLoginOrchestrator = () => {
    const [isTiktokLoading, setIsTiktokLoading] = useState(false);
    const [inviteLinkInput, setInviteLinkInput] = useState("");

    const { businessLogin } = useBusinessAuthStore();

    const INVITE_CODE = 'GO43-TEST';

    const isInviteValid = inviteLinkInput.trim() === INVITE_CODE;
    
    const tiktokStart = async () => {
        try {
            await AsyncStorage.multiRemove(['token', 'user', 'tiktokTokenExpiry']);
            useAuthStore.setState({
              user: null,
              token: null,
              isAuthenticated: false
            });
            
            await LoginServices.authorizeTikTok();
          } catch (error) {
            console.error("TikTok authorize error:", error);
          }
    }

    const businessLoginOrch = async (businessEmail: string, password: string) => {
      const response = await businessLogin(businessEmail, password);
      if (response?.success) {
        return { success: true, data: response.data };
      } else {
        Alert.alert("Error", response?.error);
      }
    }

    const inviteSubmitOrch = async (inviteLinkInput: string) => {
      
      if (!isInviteValid) return;
      return { success: true, data: { message: "Invite code is valid" } };
    }

    const businessLogoutOrch = async () => {
      try {
        const { businessLogout } = useBusinessAuthStore.getState();
        await businessLogout();
        return { success: true };
      } catch (error) {
        console.error("Logout error:", error);
        return { success: false, error: (error as Error).message };
      }
    };

    return { 
        isTiktokLoading, 
        setIsTiktokLoading ,
        inviteLinkInput,
        setInviteLinkInput,
        isInviteValid,
        tiktokStart,
        businessLoginOrch,
        inviteSubmitOrch,
        businessLogoutOrch,
    };
}