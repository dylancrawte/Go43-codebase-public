import { create } from "zustand";
import { MediaService } from "../controllers/services/mediaServices";

export const useCampaignStore = create((set) => ({
  campaigns: [],
  currentCampaign: null,
  isLoading: false,
  error: null,

  setCampaigns: (campaigns) => set({ campaigns }),
  setCurrentCampaign: (campaign) => set({ currentCampaign: campaign }),
  setError: (error) => set({ error }),

  createCampaign: async (campaignData, token) => {
    set({ isLoading: true, error: null });
    try {
      // 1 - upload image to cloudinary if it exists
      let imageUrl = null;
      if (campaignData.image) {
        const uploadResult = await MediaService.uploadImageToCloudinary(campaignData.image);
        if (!uploadResult?.success || !uploadResult.data?.url) {
          throw new Error(uploadResult?.error || "Failed to upload image to Cloudinary");
        }
        imageUrl = uploadResult.data.url;
      }

      // 2 - create campagin with cloudinary image url
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/campaign/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...campaignData,
          image: imageUrl || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to create campaign");
      
      set((state) => ({
        campaigns: [...state.campaigns, data.campaign],
        isLoading: false,
      }));
      return { success: true, campaign: data.campaign };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },
}));