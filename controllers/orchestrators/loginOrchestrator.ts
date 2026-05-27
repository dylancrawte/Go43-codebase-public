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
            console.log("tiktok authorize error: ", error);
          }
    }

    // ------------------------------ BUSINESS ORCH ------------------------------

    const mapCampaignData = (campaign: any) => ({
      eventName: campaign.eventName,
      date: campaign.date,
      time: campaign.time,
      artist: campaign.artist,
      genreTags: Array.isArray(campaign.genreTags) ? campaign.genreTags : [campaign.genreTags],
      location: campaign.location,
      brief: campaign.brief,
      image: campaign.image,
      contentDeliveryDeadline: campaign.contentDeliveryDeadline,
      spotifyLink: campaign.spotifyLink || ""
  });

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
        mapCampaignData,
        //
        tiktokStart,
        businessLoginOrch,
        inviteSubmitOrch,
        businessLogoutOrch,
    };
}